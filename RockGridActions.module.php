<?php namespace ProcessWire;
class RockGridActions extends WireData implements Module {
  public static function getModuleInfo() {
    return [
      'title' => 'RockGrid Actions Module',
      'version' => '0.0.1',
      'author' => 'Bernhard Baumrock',
      'summary' => 'Module that handles RockGridActions.',
      'icon' => 'bolt',
      'singular' => true,
      'requires' => ['FieldtypeRockGrid'],
    ];
  }

  /**
   * WireArray holding all actions
   * 
   * This holds ALL actions available on the system independently from their
   * access state. The getActions() method takes care of access control.
   *
   * @var WireArray
   */
  private $actions;

  /**
   * Init the module
   *
   * @return void
   */
  public function init() {
    $this->loadBatcher();
    $this->loadActionAssets();

    // add clearfix inputfield to this wrapper
    $this->addHookBefore("InputfieldWrapper::render", function(HookEvent $event) {
      $wrapper = $event->object; /** @var InputfieldWrapper $wrapper */
      foreach($wrapper->children() as $field) {
        $clearfix = $this->modules->get('InputfieldMarkup'); /** @var InputfieldMarkup $clearfix */
        $clearfix->addClass('clearfix');
        $clearfix->val('---clearfix---');
        if($field->clearfixBefore) $wrapper->insertBefore($clearfix, $field);
        if($field->clearfixAfter) $wrapper->insertAfter($clearfix, $field);
      }
    });
  }

  /**
   * Load RockBatcher files
   *
   * @return void
   */
  private function loadBatcher() {
    $this->config->scripts->add($this->urls($this)."lib/RockBatcher.js");
    $this->config->scripts->add($this->urls($this)."lib/progressbar.min.js");
    $this->modules->get('JqueryUI')->use('vex');
    $this->config->scripts->add($this->urls($this)."lib/RockBatcherVex.js");
  }

  /**
   * Load action assets
   *
   * @return void
   */
  private function loadActionAssets() {
    // load actions
    $this->actions = $this->wire(new WireArray);
    $this->loadActions();
    
    // load the js + css files
    $file = $this->className.".js";
    if(is_file($this->config->paths($this).$file)) $this->config->scripts->add($this->urls($this).$file);
    $file = $this->className.".css";
    if(is_file($this->config->paths($this).$file)) $this->config->styles->add($this->urls($this).$file);

    // add the GridAction JS class
    $this->config->scripts->add($this->urls($this)."RockGridAction.js");
  }

  /**
   * Load all actions
   *
   * @return void
   */
  private function loadActions() {
    // load the base action and result class first
    require_once('actions/RockGridAction.php');
    require_once('RockGridActionResult.php');


    $options = ['extensions'=>['php']];
    
    // load actions from /site/assets first
    // this makes sure that actions shipped with the module do not overwrite custom actions
    $files = $this->files->find($this->config->paths->assets.'RockGrid/actions', $options);
    foreach($files as $file) $this->addAction($file);

    // now add actions shipped with the module
    $files = $this->files->find(__DIR__.'/actions', $options);
    foreach($files as $file) $this->addAction($file);
  }

  /**
   * Add action from file
   *
   * @param string $file
   * @return void
   */
  private function addAction($file) {
    // exit if file does not exist
    if(!is_file($file)) return;

    // get file info
    $info = (object)pathinfo($file);
    $className = "\\ProcessWire\\{$info->filename}";

    // skip the abstract base class
    if($info->filename == 'RockGridAction') return;
    
    // skip already loaded classes (two actions with same name)
    if($this->actions->has("className=".$info->filename)) return;

    // get action code and add it to the array
    require_once($file);
    $action = $this->wire(new $className());
    $action->init();

    // add action to actions array
    $this->actions->add($action);
  }

  /**
   * Return all actions
   *
   * @return WireArray
   */
  public function getActions() {
    return $this->actions->sort('name');
  }

  /**
   * Get action by name
   *
   * @param string $name
   * @return RockGridAction|false
   */
  public function getAction($name) {
    return $this->getActions()->findOne("name=$name");
  }

  /**
   * Return the fieldset GUI for grid actions.
   *
   * @return InputfieldFieldset
   */
  public function getGui($gridname, $options = []) {
    if(!$gridname) throw new WireException("First parameter must be set (gridname)!");
    $actions = $this->getActions($gridname);

    // defaults
    $defaults = [
      'collapsed' => Inputfield::collapsedYesAjax,
    ];
    $options = (object)array_merge($defaults, $options);
    
    /** @var InputfieldFieldset $fs */
    $fs = $this->modules->get('InputfieldFieldset');
    $fs->label(__('Grid Actions'));
    $fs->collapsed($options->collapsed);
    $fs->gridname = $gridname;
    $fs->addClass('RockGridActionsGui');
    $fs->attr('data-grid', $gridname); // why is this applied to <ul> inside the fieldset?
    $fs->attr('id+name', "gridactions_$gridname");
    
    $f = $this->modules->get('InputfieldSelect'); /** @var InputfieldSelect $f */
    $f->label(__('Action'));
    $f->attr('id+name', "{$fs->id}_action");
    $f->addClass('RockGridActionSelect');
    $f->columnWidth(50);
    foreach($actions as $action) $f->addOption($action->name, $action->label);
    $f->val($this->input->get('action', 'text'));
    $fs->add($f);

    $f = $this->modules->get('InputfieldRadios'); /** @var InputfieldRadios $f */
    $f->label(__('Rows'));
    $f->attr('id+name', "{$fs->id}_rows");
    $f->addClass('RockGridActionRows');
    $f->columnWidth(50);
    $f->addOption('none', __('None'));
    $f->addOption('all', __('All'));
    $f->addOption('filtered', __('All filtered'));
    $f->addOption('selected', __('All selected'));
    $f->val('none');
    $this->addShowIf($fs, $f);
    $f->clearfixAfter = true;
    $fs->add($f);

    $this->addActionGuis($fs);

    /** @var InputfieldButton $b */
    $b = $this->modules->get('InputfieldButton');
    $b->attr('id+name', "{$fs->id}_submit");
    $b->clearfixBefore = true;
    $b->addClass('rockgridactions-execute');
    $b->val(__('Execute'));
    $b->icon('bolt');
    $fs->add($b);

    // load javascript and css assets
    foreach($actions as $action) $action->loadAssets();

    return $fs;
  }

  /**
   * Add action GUIs to this fieldset
   *
   * @param InputfieldFieldset $fs
   * @return void
   */
  public function addActionGuis($fs) {
    foreach($this->getActions($fs->gridname) as $action) {
      $gui = $action->getGui($fs);
      if(!$gui) continue;
      $gui->showIf("{$fs->id}_action=$action");
      $gui->attr('data-action', $action);
      $gui->icon($action->icon);
      $fs->add($gui);
    }
  }

  /**
   * Add showIf attribute to this field
   *
   * @param InputfieldFieldset $fs
   * @param InputfieldRadios $f
   * @return void
   */
  public function addShowIf($fs, $f) {
    $field = "{$fs->id}_action";
    $sep = '';
    $values = '';
    foreach($this->getActions($fs->gridname) as $action) {
      if(!$action->showRows) continue;
      $values.=$sep.$action->name;
      $sep = '|';
    }
    $f->showIf("$field=$values");
  }

  /**
   * Add clearfix field to fieldset
   *
   * @param InputfieldFieldset $fs
   * @return void
   */
  public function addClearfix($fs) {
    /** @var InputfieldMarkup $f */
    $f = $this->modules->get('InputfieldMarkup');
    $f->value = '---clearfix---';
    $f->addClass('InputfieldClearfix');
    $fs->add($f);
  }

  /**
   * debugInfo
   *
   * @return array
   */
  public function __debugInfo() {
    $actions = [];
    foreach($this->getActions() as $action) $actions[$action->name] = $action;

    $info = parent::__debugInfo();
    $info['actions'] = $actions;
    return $info;
  }
}
