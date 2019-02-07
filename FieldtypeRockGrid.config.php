<?php namespace ProcessWire;
/**
 * RockGrid Config
 *
 * @author Bernhard Baumrock, 07.02.2019
 * @license Licensed under MIT
 */
class FieldtypeRockGridConfig extends ModuleConfig {

  public function __construct() {
    $this->add([
      'nolocale' => [
        'type' => 'checkbox',
        'label' => 'Do not load moment.js with locale support',
      ],
    ]);
  }
}

