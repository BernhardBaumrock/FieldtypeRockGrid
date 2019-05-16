<?php namespace ProcessWire;
class RockGridActionTrash extends RockGridAction {
  public $label = 'Trash Items';
  
  /**
   * Execute this action
   *
   * @param object $data
   * @return RockGridActionResult
   */
  public function execute($data) {
    $result = $this->result;

    // execute items
    $num = 0;
    foreach($data->chunk as $id) {
      $page = $this->pages->get($id);
      if(!$page->trashable) throw new WireException("Item #$id is not trashable!");
      $page->trash();
      $num++;
    }

    $result->msg = "$num items trashed.";
    return $result;
  }
}
