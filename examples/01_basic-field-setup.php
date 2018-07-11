<?php namespace ProcessWire;

// optional: load external asset
$this->rg->assets->add($this->config->paths->siteModules . 'FieldtypeRockGrid/lib/moment.min.js');

// set data for this grid via rockfinder
$this->setData(new RockFinder("sort=-created", [
  'title',
  'created',
]));
