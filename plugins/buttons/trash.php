<?php
$this->ajax('trash', function($data) {
  foreach($data as $id) {
    $p = $this->wire->pages->get($id);
    if(!$p->trashable()) continue;
    $this->pages->trash($p);
  }
});
