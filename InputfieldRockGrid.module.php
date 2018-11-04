<?php namespace ProcessWire;
/**
 * Inputfield to display agGrid inside the pw admin
 * 
 * Bernhard Baumrock, baumrock.com
 * MIT
 */
class InputfieldRockGrid extends Inputfield {

  private $rg; // reference to the fieldtype
  public $field; // reference to field for frontend rendering
  private $frontendorbackend; // frontend or backend?
  private $inBackend; // frontend or backend?
  private $assetsLoaded; // flag if global scripts and styles where already added
  private $initData = []; // variable holding the initial data setup for the grid, see setData() method
  private $js = [];

  // array of ajax callbacks
  private $ajax = [];

  public $translationStrings = [];

  public static function getModuleInfo() {
    return array(
      'title' => 'RockGrid',
      'author' => 'Bernhard Baumrock, baumrock.com',
      'version' => '0.0.15',
      'summary' => 'Allows rendering of agGrids in the PW admin.',
      'requires' => 'FieldtypeRockGrid', 
      );
  }

  public function init() {
    $this->rg = $this->modules->get('FieldtypeRockGrid');
    
    // assign the current field to its reference
    // this reference is necessary for frontend rendering of the grid
    // because the field instance is not available there and is set manually
    $this->field = $this;

    // flag wheter we are in the frontend or in the backend
    $this->frontendorbackend = $this->process->className === 'ProcessPageView' ? 'frontend' : 'backend';
    $this->inBackend = $this->process->className === 'ProcessPageView' ? false : true;

    if($this->inBackend) {
      // load vex library for dialogs
      $this->wire('modules')->get('JqueryUI')->use('vex');
    }
  }
  
  /**
   * Called before render()
   *
   * @param Inputfield $parent
   * @param bool $renderValueMode
   * @return bool
   *
   */
  public function renderReady(Inputfield $parent = null, $renderValueMode = false) {
    // load assets
    // places in renderReady for ajax fields
    $this->loadAssets();

    return parent::renderReady($parent, $renderValueMode);
  }

  /**
   * Render the Datatable Markup
   */
  public function ___render() {
    $timer = Debug::timer();

    // load assets only if they have not already been loaded from renderReady method
    // frontend usage of the module does not call renderReady method
    if(!$this->assetsLoaded) $this->loadAssets();

    // check if this request was an ajax request to get the field's data
    $this->handleAJAX();

    // setup field height
    $height = '';
    if($this->height) $height = "style='height: {$this->height}px'";

    // field settings
    $this->js([
      'settings' => [
        'initPageSize' => $this->rg->pageSizes[$this->pageSize ?: 0],
        'pageSizes' => $this->rg->pageSizes,
        'height' => $this->height,
      ]
    ]);

    // // start markup output
    // // first we add the dom element, then the necessary javascript
    // // nowrap is needed for scrollX
    $data = $this->getData(['init'=>true]);
    ob_start(); ?>
    <div class="RockGridWrapper <?= $this->frontendorbackend ?> InputfieldIgnoreChanges" id="RockGridWrapper_<?= $this->field->name ?>">
      <div id="RockGridItem_<?= $this->field->name ?>" class="RockGridItem ag-theme-balham" data-id="<?= $this->field->name ?>" <?= $height ?>></div>
      <div class="init"></div>
    </div>
    <script>
    // translation strings for this grid
    var RockGridStr_<?= $this->field->name ?> = {
      <?php
      foreach($this->translationStrings as $name=>$str) echo "'$name':'". $this->sanitizer->entities($str) . "',";
      ?>
    }

    // grid settings object
    var gridSettings_<?= $this->field->name ?> = {
      grid: '<?= $this->field->name ?>',
      dataColumns: <?= json_encode($this->getDataColumns($data)) ?>,
      data: <?= json_encode($data) ?>,
      js: <?= json_encode($this->js) ?>,
    };

    // function to init the grid
    var initGrid_<?= $this->field->name ?> = function() {
      RockGrid.init(gridSettings_<?= $this->field->name ?>);
      <?php
      // add translation strings
      echo "RockGrid.getGrid('{$this->field->name}').str = RockGridStr_" . $this->field->name;
      ?>
    }

    // load the grid automatically or manually?
    if(typeof onLoad_<?= $this->field->name ?> == 'function') {
      // load grid manually
      // sometimes this is needed when we have to wait for other grids to be loaded
      onLoad_<?= $this->field->name ?>(gridSettings_<?= $this->field->name ?>, RockGridStr_<?= $this->field->name ?>);
    }
    else {
      // load this grid when dom is loaded
      initGrid_<?= $this->field->name ?>();
    }
    </script>

    <?php
    if($this->initData AND is_object($this->initData) AND count($lines = $this->initData->debuginfo)) {
      $lines[] = [
        'name' => 'Overall Inputfield Render',
        'value' => Debug::timer($timer)*1000,
        'desc' => '',
      ];
      echo 'Debug Info:<table class="uk-table uk-table-striped uk-table-small">';
      $sum = 0;
      foreach($lines as $line) {
        echo "<tr>";
        echo "<td class='uk-text-right uk-table-shrink'>" . $line['value'] . "ms</td>";
        echo "<td class='uk-table-shrink uk-text-nowrap'>" . $line['name'] . "</td>";
        echo "<td class='uk-table-expand'>" . $line['desc'] . "</td>";
        echo "</tr>";
        $sum+=$line['value'];
      }
      echo '</table>';
    }
    ?>
    <?php
    return ob_get_clean();
  }

  /**
   * add translation string
   */
  public function x($name, $str) {
    $this->translationStrings[$name] = $str;
  }

  /**
   * get available options of given select options field
   */
  public function getOptionsFromField($fieldname) {
    $options = [];
    foreach($this->wire->fieldtypes->get('FieldtypeOptions')->getOptions($fieldname) as $item) {
      $options[$item->id] = $item->title;
    }
    return $options;
  }

  /**
   * more verbose version of deprecated ajax() method
   * todo: change $this->ajax to $this->ajaxActions
   * $this->ajax is already used for the ajax setting of the grid
   */
  public function addAjaxAction($name, $func, $options = []) {
    $this->ajax[$name] = [$func, $options];
  }

  /**
   * get actions via hookable method
   * that makes it possible to attach custom actions to any of your grids
   */
  public function ___getAjaxActions() {
    return $this->ajax;
  }

  /**
   * handle AJAX requests
   * 
   * every ajax request that returns data needs to have the following parameters set
   * - field: the fieldname, this ensures that the field is rendered even when the input setting is set to "AJAX load"
   * - RockGrid: flag variable that needs to be set to 1
   */
  public function handleAJAX() {
    // early exits
    if(!$this->config->ajax) return;
    if(!$fieldname = $this->sanitizer->text($this->input->get->field)) return;
    if(!$this->input->get->RockGrid) return;

    // on ajax requests the loadAssets() method was already called but with an early exit
    // the field was not available until now, so we need to loadd the assets again
    // this is to load the php file with the data definition
    if(!$this->assetsLoaded) $this->loadAssets();

    // get data
    // this makes sure the field's php file is executed and ajax callbacks are present
    $data = $this->getData();

    // return gzipped json data
    header('Content-Type: application/json');

    // check if an ajax action callback was requested
    $action = $this->sanitizer->text($this->input->post->action);
    $actions = $this->getAjaxActions();

    if($action AND isset($actions[$action]) AND !is_string($actions[$action][0]) AND is_callable($actions[$action][0])) {
      $payload = $this->input->post('data');
      $func = $actions[$action][0];
      $options = $actions[$action][1];
      if(count($options)) $data = $func->__invoke($payload, $options);
      else $data = $func->__invoke($payload);
    }

    if($this->field->nocompression) {
      echo json_encode($data);
    }
    else {
      ob_start("ob_gzhandler");
      echo json_encode($data);
      ob_end_flush();
    }
    die();
  }

  /**
   * get columns for this grid based on data
   */
  public function getDataColumns($data) {
    if($data === 'ajax') $data = $this->getData();
    if(!$data OR !count($data)) return [];
    return array_keys((array)$data[0]);
  }

  /**
   * check wether the current request is an ajax request to get field-data
   * there are also regular ajax requests on ajax-loaded fields
   */
  private function isDataAjax() {
    return ($this->config->ajax AND $this->input->get->RockGrid);
  }

  /**
   * add scripts and styles based on the field's name
   * 
   * usage:
   * you can load css and javascript files
   * if the field's name is rg1 you can place a file /site/assets/RockGrid/fields/rg1.css|.js
   * you can use the "frontend" or "backend" class that is applied to the RockGridWrapper
   * in your css selectors to style grids differently
   * 
   * todo: rewrite loading of assets completely
   * this method is a mess...
   */
  private function loadAssets() {
    // on ajax requests the field will be assigned later in the handleAJAX() method
    // the data assets will be loaded manually
    // no need to load anything here
    if($this->isDataAjax) return;

    // include the global language file
    @include_once($this->config->paths->assets . "RockGrid/lang.php");

    // make sure the folders exist
    $dirs = [
      $this->config->paths->siteModules . "FieldtypeRockGrid/plugins",
      $this->config->paths->siteModules . "FieldtypeRockGrid/renderers",
      $this->config->paths->siteModules . "FieldtypeRockGrid/formatters",
      $this->config->paths->siteModules . "FieldtypeRockGrid/coldefs",
      $this->config->paths->assets . "RockGrid/plugins",
      $this->config->paths->assets . "RockGrid/renderers",
      $this->config->paths->assets . "RockGrid/formatters",
      $this->config->paths->assets . "RockGrid/coldefs",
    ];
    foreach($dirs as $dir) if(!is_dir($dir)) $this->wire->files->mkdir($dir, true);

    // todo: does this load all fields even when only one field is displayed??
    foreach($this->wire->files->find($this->config->paths->assets.'RockGrid/fields/', ['extensions' => ['php', 'js', 'css']]) as $file) {
      $this->rg->assets->add($file);
    }

    // add all files from folder /site/assets/RockGrid/fields/ related to this field
    // first we set the data, this will also set the assetsdir session variable
    $this->setDataFromFile($this->field->name);
    if($this->field->assetsDir) {
      $dir = rtrim($this->field->assetsDir, "/");
      $this->rg->assets->add("$dir/{$this->field->name}.css");
      $this->rg->assets->add("$dir/{$this->field->name}.js");
    }
    else {
      $this->rg->assets->add("{$this->config->paths->assets}RockGrid/fields/{$this->field->name}.css");
      $this->rg->assets->add("{$this->config->paths->assets}RockGrid/fields/{$this->field->name}.js");
    }
    
    if(!$this->assetsLoaded) {
      // add aggrid
      $min = $this->config->debug ? '' : '.min';
      $this->rg->assets->add($this->config->paths->siteModules . "FieldtypeRockGrid/lib/ag-grid$min.js");

      // load necessary scripts
      $this->rg->assets->add($this->config->paths->siteModules . "FieldtypeRockGrid/lib/moment$min.js"); // load moment.js
      $this->rg->assets->add($this->config->paths->siteModules . "FieldtypeRockGrid/lib/currency.min.js"); // load currency.js
      $this->rg->assets->add($this->config->paths->siteModules . "FieldtypeRockGrid/lib/progressbar.min.js"); // add progressbar library for batcher

      // add all js and css files
      // bug: i think this will also add files not present on current page?
      foreach($dirs as $dir) {
        foreach($this->files->find($dir, ['extensions' => ['js', 'css']]) as $file) {
          $this->rg->assets->add($file);
        }
      }

      // add global scripts and styles by user
      $this->rg->assets->add("{$this->config->paths->assets}RockGrid/global.css");
      $this->rg->assets->add("{$this->config->paths->assets}RockGrid/global.js");
      if(is_file($global = "{$this->config->paths->assets}RockGrid/global.php")) {
        include($global);
      }

      // load libraries
      $this->rg->assets->add("{$this->config->paths->siteModules}RockGrid/lib/progressbar.min.js");

      // finally add RockGrid and RockGridItem classes when all plugins are loaded
      $this->rg->assets->add($this->config->paths->siteModules . "FieldtypeRockGrid/RockGridPlugin.js");
      $this->rg->assets->add($this->config->paths->siteModules . "FieldtypeRockGrid/RockGrid.js");
      $this->rg->assets->add($this->config->paths->siteModules . "FieldtypeRockGrid/RockGridItem.js");
      $this->rg->assets->add($this->config->paths->siteModules . "FieldtypeRockGrid/RockGridAjax.js");
      $this->rg->assets->add($this->config->paths->siteModules . "FieldtypeRockGrid/RockGrid.css");
    }
    $this->assetsLoaded = true;
  }

  /**
   * set data from included file
   */
  private function setDataFromFile($fieldname) {
    $this->prepareAssetsDir();
    // if the field has a custom assets folder present we load the file from there
    if($this->assetsDir) {
      // a custom assets dir was set
      // we save that dir to the php session so that ajax requests know
      // where to get the data from and the client cannot modify this path
      // $this->wire->session->set('assetsDir', $this->assetsDir);
      $file = rtrim($this->assetsDir, '/') . "/$fieldname.php";

      // save this path to the php session for following ajax requests
      // on ajax we only know the field name and the related assetsDir
      // must be provided on the server side to prevent client-side manipulations
      $this->wire->session->set('RockGridAssetsDir_'.$fieldname, $file);
    }
    else {
      $file = $this->config->paths->assets . "RockGrid/fields/$fieldname.php";
    }
    if(is_file($file)) $this->includeFile($file);
  }

  /**
   * prepare assets dir to make sure it has no trailing slash
   */
  private function prepareAssetsDir() {
    if(!$this->assetsDir) return;

    // if it is already correct return
    if(is_dir($this->assetsDir)) return;

    // if it is not a directory try to prepend the sites root path
    if(!is_dir($this->assetsDir)) {
      $dir =
        $this->wire->config->paths->root.
        trim($this->assetsDir, "/");
      if(is_dir($dir)) {
        $this->assetsDir = $dir;
        return;
      }
    }

    // wrong assets dir, reset it
    $this->wire->warning($this->assetsDir . " not found");
    $this->assetsDir = null;
  }

  /**
   * set data for this field
   * 
   * @param data string|RockFinder
   * 
   * usage:
   * 
   * option 1: set selector + fields used by $pages->findObjects()
   * option 2: set array of objects (custom data)
   */
  public function setData($data) {
    $this->initData = $data;

    if($this->initData instanceof RockFinder) {
      $this->initData->debug = $this->debug;
    }
  }

  /**
   * get data for this field
   */
  public function getData($options = []) {
    $sanitizer = $this->sanitizer;
    $get = $this->input->get;
    $defaults = [
      'limit' => 0,
    ];
    $options = array_merge($defaults, $options);

    // if data was not set yet, load assets to load data
    if($this->initData === []) {
      if(!$this->field->name) {
        // when loading from a processmodule the field is not available
        $fieldname = $this->sanitizer->text($this->input->get('field'));

        // set the field name according to the ajax request
        // we need the field name to retrieve several data on ajax requests
        $this->field->name = $fieldname;

        // include the data file
        // if a custom path is set in the session get this file
        // otherwise get the default file in the assets folder
        $file = '';
        $file = $this->wire->session->get("RockGridAssetsDir_$fieldname");
        if(!$file) $file = $this->config->paths->assets . "RockGrid/fields/$fieldname.php";
        $this->includeFile($file);
      }
      $this->loadAssets();
    }

    // check if the request comes from the RockGrid.init() call
    // in this case we return 'ajax' when the field is set to load data via ajax
    // this prevents the initial table from loading huge amounts of data
    // and makes the initial page load faster
    if(isset($options['init']) AND $this->ajax) return 'ajax';

    // catch sql errors
    try {
      // check if data is set as SQL statement
      // whenever is starts with "select" is is taken as sql statement
      $sql = $this->sql;
      if(!$sql AND is_string($this->initData) AND strtoupper(substr($this->initData, 0, 6)) === 'SELECT') {
        $sql = $this->initData;
      }

      // check type of initial data
      if($sql) {
        // if a limit was set, append it to the selector
        // this is the case when we do the query to get all data columns
        if($options['limit']) $sql .= ' LIMIT ' . $options['limit'];

        // sql query as datasource
        $results = $this->database->query($sql);
        return $results->fetchAll(\PDO::FETCH_OBJ);
      }
      elseif($this->initData instanceof RockFinder) {
        // RockFinder was provided as datasource
        $finder = $this->initData;

        // if a limit was set, append it to the selector
        // this is the case when we do the query to get all data columns
        if($options['limit']) $finder->limit = ',limit=' . $options['limit'];

        return $finder->getObjects();
      }
      else {
        // the data for this grid was set manually
        if(count($this->initData)) return $this->initData[0];
        return '';
      }
    }
    catch(\PDOException $e) {
      $this->error("SQL Error:\n\n" . $e);
    }
  }

  /**
   * add data to a javascript object
   */
  public function js($data = []) {
    // merge provided data into the js data array
    $this->js = array_merge($this->js, $data);
  }

  /**
   * add ajax functions to this grid
   * deprecated, for backwards compatibility
   * use addAjaxAction instead
   */
  public function ajax($name, $func, $options = []) {
    $this->ajax[$name] = [$func, $options];
  }

  /**
   * include data file
   */
  private function includeFile($file) {
    // get the current page
    // todo: check if that works on frontend
    // is it save to use?
    $page = new Page();
    
    if($this->input->get('id')) $page = $this->pages->get($this->input->get('id'));
    if($this->process == "ProcessPageEdit") $page = $this->process->getPage();
    
    // include the corresponding plugin-file
    foreach($this->files->find(__DIR__ . '/plugins', ['extensions' => ['php']]) as $plugin) {
      include($plugin);
    }

    // include the field's data-file
    include($file);
  }
}

