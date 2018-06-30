<?php namespace ProcessWire;

// optional: load external asset
$this->rg->assets->add($this->config->paths->siteModules . 'RockGrid/lib/moment.min.js');

// set data for this grid via rockfinder
$this->setData(new RockFinder("template=project, sort=-created", [
  'title',
  'pl_name',
  'deadline',
]));

// optional: pass variables to javascript
$this->js([
  'show' => __('Projekt anzeigen'),
  'pl_name' => __('Projektleiter'),
  'title' => __('Bezeichnung'),
  'deadline' => __('Deadline'),
]);
