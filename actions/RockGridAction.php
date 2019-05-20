<?php namespace ProcessWire;
abstract class RockGridAction extends Wire {

  /**
   * Label of the action
   *
   * @var string
   */
  public $label;

  /**
   * Unique name of the action
   *
   * @var string
   */
  public $name;

  /**
   * Icon for this action
   *
   * @var string
   */
  public $icon;

  /**
   * Show row selection radio for this action?
   *
   * @var boolean
   */
  public $showRows = true;

  /**
   * Uniqe string to prefix field ids
   * 
   * Actions can use the same Inputfield multiple times so we need to prefix it
   * to be uniqe across the whole page.
   *
   * @var string
   */
  protected $prefix;

  /**
   * Result object
   *
   * @var RockGridActionResult
   */
  public $result;

  /**
   * Class constructor
   */
  public function __construct() {
    $this->name = lcfirst(str_replace('RockGridAction', '', $this->className()));
    if(!$this->label) $this->label = $this->name;
    $this->result = new RockGridActionResult();
  }

  /**
   * Init method of this action
   * 
   * This method will be called right after the class has been loaded.
   *
   * @return void
   */
  public function init() {}

  /**
   * Check if this action is executable for the given grid
   * 
   * Here you can also add all checks related to access control.
   * By default all actions show up for all users and all grids.
   *
   * @param string $grid
   * @return boolean
   */
  public function ___isExecutable($grid) {
    return true;
  }

  /**
   * Execute this action
   * 
   * This method can throw a WireException and the error message will be
   * displayed properly in the results log of the VEX gui. See
   * RockGridActionTrash as an example.
   *
   * @param object|WireInputData $data
   * @return object
   */
  abstract public function execute($data);

  /**
   * Get GUI for this action
   * 
   * If set, the first parameter is the GridActions GUI Fieldset holding
   * the grids' name (for customizing the GUI for different grids).
   *
   * @param InputfieldFieldset $fieldset
   * @return InputfieldFieldset
   */
  public function getGui($fieldset) {}

  /**
   * Get the prefix for the given fieldset
   *
   * @param InputfieldFieldset $fieldset
   * @return void
   */
  protected function getPrefix($fieldset) {
    return "{$fieldset->name}_{$this->name}";
  }

  /**
   * Get the filename of the current action
   * 
   * We need that filename for loading the corresponding JS and CSS files.
   * This takes care of inheritance:
   * https://stackoverflow.com/questions/6985774/php-file-inheritence
   *
   * @return string
   */
  public function getFilename($ext = 'php') {
    $c = new \ReflectionClass($this);
    $file = substr($c->getFileName(),0,-3).$ext;
    return is_file($file) ? $this->config->paths->normalizeSeparators($file) : false;
  }

  /**
   * Return relative path to root
   * 
   * @param string $file
   */
  public function getFileUrl($ext = 'php') {
    $file = $this->getFilename($ext);
    if(!$file) return false;
    return str_replace($this->config->paths->root, $this->config->urls->root, $file);
  }

  /**
   * Load related assets
   *
   * @return void
   */
  public function loadAssets() {
    $this->config->scripts->add($this->getFileUrl('js'));
    $this->config->styles->add($this->getFileUrl('css'));
  }

  /**
   * Magic method if requested as string
   *
   * @return string
   */
  public function __toString() {
    return $this->name;
  }

  /**
   * debugInfo
   *
   * @return array
   */
  public function __debugInfo() {
    $info = parent::__debugInfo();
    $info['name'] = $this->name;
    $info['label'] = $this->label;
    $info['file'] = $this->getFilename();
    return $info;
  }
}
