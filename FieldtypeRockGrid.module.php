<?php namespace ProcessWire;
/**
 * Fieldtype to display agGrid inside the PW admin
 * 
 * Bernhard Baumrock, baumrock.com
 * MIT
 */
class FieldtypeRockGrid extends Fieldtype {
  public $assets;
  public $pageSizes = [10, 25, 50, 100];
  public $translationStrings = [];

  public static function getModuleInfo() {
    return array(
      'title' => 'RockGrid',
      'author' => 'Bernhard Baumrock, baumrock.com',
      'version' => 4,
      'summary' => 'RockGrid Main Module',
      'requires' => ['RockFinder'],
      'installs' => ['InputfieldRockGrid'],
      'icon' => 'table',
      'autoload' => true,
      );
  }

  /**
   * module initialisation
   */
  public function init() {
    $this->assets = new FilenameArray();
  }

  /**
   * attach pagerender hook when api is ready
   */
  public function ready() {
    // add scripts after page render
    $this->wire->addHookAfter('Page::render', function($event) {
      $event->return = str_replace('</head>', $this->renderAssets().'</head>', $event->return);
      $event->return = str_replace(
        '</body>',
        "<script>document.dispatchEvent(new Event('DOMReady'))</script></body>",
        $event->return
      );
    });
    
    // show only json data on ajax requests
    $this->wire->addHookBefore('Page::render', function($event) {
      $this->modules->get('InputfieldRockGrid')->handleAJAX();
    });
  }

  /**
   * render scripts & styles html tag
   * bug: the field loads ALL assets of all fields, even those not loaded on this page
   */
  public function renderAssets() {
    $out = "\n";
    foreach($this->assets->unique() as $asset) {
      // skip non-existing files
      if(!is_file($asset)) continue;

      // make sure the path is relative to the rootfolder
      $asset = str_replace($this->config->paths->root, '/', $asset);
      $file = pathinfo($asset);
      switch($file['extension']) {
        case 'js':
          $out .= "\n\t<script src='$asset'></script>";
          break;
        case 'css':
          $out .= "\n\t<link rel='stylesheet' type='text/css' href='$asset'>";
          break;
      }
    }

    // add language translation strings
    $out .= "\n\t<script>if(typeof RockGrid != 'undefined') RockGrid.str = {";
    foreach($this->translationStrings as $name=>$str) $out .= "'$name':'". $this->sanitizer->entities($str) . "',";
    $out .= "};</script>\n\n";

    return $out;
  }

  /**
   * add translation string
   */
  public function x($name, $str) {
    $this->translationStrings[$name] = $str;
  }

  /**
   * Return the associated Inputfield
   */
  public function getInputfield(Page $page, Field $field) {
    $inputField = $this->modules->get('InputfieldRockGrid');
    $inputField->addClass('InputfieldIgnoreChanges');
    $inputField->set('ajax', $field->ajax);
    $inputField->set('debug', $field->debug);
    $inputField->set('nocompression', $field->nocompression);
    $inputField->set('pageSize', $field->pageSize);
    $inputField->set('height', $field->height);
    return $inputField;
  }

  /**
   * the formatted value of this field
   * necessary to render the grid's markup on the frontend
   */
  public function sanitizeValue(Page $page, Field $field, $value) {
    if($this->process == 'ProcessPageView') {
      $f = $this->getInputfield($page, $field);
      $f->field = $field;
      return $f->render();
    }
  }

  ###########################################################################################

  /**
   * config inputfields for this fieldtype
   */
  public function ___getConfigInputfields(Field $field) {
    $inputfields = parent::___getConfigInputfields($field);
    $assetpath = '/site/assets/RockGrid/fields/';

    // loading type ajax or inline
      $f = $this->modules->get('InputfieldCheckbox');
      $f->attr('name', 'ajax');
      $f->attr('checked', $field->ajax ? 'checked' : '');
      $f->label = $this->_("Load data via AJAX");
      $f->description = $this->_("If you have a large amount of data this option should be activated.");
      $f->columnWidth = 33;
      $inputfields->add($f);

    // dont use compression for this field
      $f = $this->modules->get('InputfieldCheckbox');
      $f->attr('name', 'nocompression');
      $f->attr('checked', $field->nocompression ? 'checked' : '');
      $f->label = $this->_("Disable compression for AJAX data");
      $f->description = $this->_("If checked the field will not compress the data that is returned by the AJAX request");
      $f->columnWidth = 33;
      $f->showIf = 'ajax=1';
      $inputfields->add($f);
    
    // set field to debug mode
      $f = $this->modules->get('InputfieldCheckbox');
      $f->attr('name', 'debug');
      $f->attr('checked', $field->debug ? 'checked' : '');
      $f->label = $this->_("Debug mode ON");
      $f->description = $this->_("If checked the field will show some debug information on the page edit screen.");
      $f->columnWidth = 34;
      $inputfields->add($f);

    // field height
      $f = $this->modules->get('InputfieldInteger');
      $f->attr('name', 'height');
      $f->value = $field->height === null ? 300 : $field->height;
      $f->label = $this->_("Field height in px");
      $f->notes = __("15 rows = 520") . "\n";
      $f->notes .= __("Use 0 for auto-height grid");
      $f->columnWidth = 50;
      $inputfields->add($f);

    // initial pagination pagesize
      $f = $this->modules->get('InputfieldSelect');
      $f->attr('name', 'pageSize');
      $f->value = $field->pageSize ?: 0;
      $f->label = $this->_("Initial Pagination PageSize");
      $f->addOptions($this->pageSizes);
      $f->columnWidth = 50;
      $f->showIf = 'height=0';
      $inputfields->add($f);

    /** @var InputfieldMarkup $f */
    $exampleFieldset = $this->wire('modules')->get('InputfieldFieldset');
    $exampleFieldset->label = $this->_('Usage instructions');
    $exampleFieldset->description = __('You need to define data and functionality for your field. Place the files in the folders like shown below.');
    $exampleFieldset->icon = 'code';
    $exampleFieldset->notes = "See also [https://gitlab.com/baumrock/FieldtypeRockGrid/wikis/quickstart](https://gitlab.com/baumrock/FieldtypeRockGrid/wikis/quickstart)";
    $inputfields->add($exampleFieldset);
    
    $f = $this->wire('modules')->get('InputfieldMarkup');
    $f->label = $assetpath.$field->name.'.php';
    $f->icon = 'file-o';
    $f->value =  $this->getCodeExample('01_basic-field-setup.php', $field);
    $exampleFieldset->add($f);

    $f = $this->wire('modules')->get('InputfieldMarkup');
    $f->label = $assetpath.$field->name.'.js';
    $f->icon = 'file-o';
    $f->value =  $this->getCodeExample('01_basic-field-setup.js', $field);
    $f->notes = 'See all options here [https://www.ag-grid.com/javascript-grid-features/](https://www.ag-grid.com/javascript-grid-features/)';
    $exampleFieldset->add($f);
    
    return $inputfields;
  }

  /**
   * get code example from file
   */
  private function getCodeExample($file, $field) {
    $out = '<pre>';
    $out .= $this->sanitizer->entities(str_replace('#yourfieldname#', $field, file_get_contents(__DIR__ . '/examples/' . $file)));
    $out .= '</pre>';
    return $out;
  }

  ###########################################################################################

  /**
   * Render a markup string of the value
   * 
   * This is important for correctly rendering markup output in listers.
   *
   * @param Page $page Page that $value comes from
   * @param Field $field Field that $value comes from
   * @param mixed $value Optionally specify the $page->getFormatted(value), value must be a formatted value. 
   *   If null or not specified (recommended), it will be retrieved automatically.
   * @param string $property Optionally specify the property or index to render. If omitted, entire value is rendered.
   * @return string|MarkupFieldtype Returns a string or object that can be output as a string, ready for output.
   *
   */
  public function ___markupValue(Page $page, Field $field, $value = null, $property = '') {
    return $value;
  }

  /**
   * The following functions are defined as replacements to keep this fieldtype out of the DB
   *
   */

  public function ___wakeupValue(Page $page, Field $field, $value) {
    return $value;
  }

  public function ___sleepValue(Page $page, Field $field, $value) {
    return $value;
  }

  public function getLoadQuery(Field $field, DatabaseQuerySelect $query) {
    // prevent loading from DB
    return $query; 
  }

  public function ___loadPageField(Page $page, Field $field) {
    // generate value at runtime rather than loading from DB
    return null; 
  }

  public function ___savePageField(Page $page, Field $field) {
    // prevent saving of field
    return true;
  }

  public function ___deletePageField(Page $page, Field $field) {
    // deleting of page field not necessary
    return true; 
  }

  public function ___deleteField(Field $field) {
    // deleting of field not necessary
    return true; 
  }

  public function getDatabaseSchema(Field $field) {
    // no database schema necessary
    return array();
  }

  public function ___createField(Field $field) {
    // nothing necessary to create the field
    return true; 
  }

  public function getMatchQuery($query, $table, $subfield, $operator, $value) {
    // we don't allow this field to be queried
    throw new WireException("Field '{$query->field->name}' is runtime and not queryable");
  }
  
  public function ___getCompatibleFieldtypes(Field $field) {
    // no fieldtypes are compatible
    return new Fieldtypes();
  }

  public function getLoadQueryAutojoin(Field $field, DatabaseQuerySelect $query) {
    // we don't allow this field to be autojoined
    return null;
  }

  public function install() {
    // track the installation of this module
    // no data is sent to my analytics account, it's just a counter
    $http = new WireHttp();
    $http->post('http://www.google-analytics.com/collect', [
      'v' => 1, // Version
      'tid' => 'UA-76905506-1', // Tracking ID / Property ID.
      'cid' => 555, // Anonymous Client ID.
      't' => 'event', // hit type
      'ec' => 'PWModules', // category
      'ea' => 'install', // action
      'el' => $this->className, // label
    ]);
  }
  public function uninstall() {
    // track the uninstallation of this module
    // no data is sent to my analytics account, it's just a counter
    $http = new WireHttp();
    $http->post('http://www.google-analytics.com/collect', [
      'v' => 1, // Version
      'tid' => 'UA-76905506-1', // Tracking ID / Property ID.
      'cid' => 555, // Anonymous Client ID.
      't' => 'event', // hit type
      'ec' => 'PWModules', // category
      'ea' => 'uninstall', // action
      'el' => $this->className, // label
    ]);
  }

}

