<?php

use ProcessWire\WireException;
$this->ajax('trash', function($data) {
  $num = 0;
  foreach($data as $id) {
    $p = $this->wire->pages->get($id);
    if(!$p->trashable()) continue;
    $num += $this->pages->trash($p);
  }
  return "Trashed $num pages";
});
