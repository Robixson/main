<?php
    /** @var $game ?\App\Model\Game */
?>

<div class="form-group">
    <label for="subject">Tytuł</label>
    <input type="text" id="title" name="post[title]" value="<?= $game ? $game->getTitle() : '' ?>">
</div>

<div class="form-group">
    <label for="content">Opis</label>
    <textarea id="description" name="post[description]"><?= $game? $game->getDescription() : '' ?></textarea>
</div>

<div class="form-group">
    <label></label>
    <input type="submit" value="Wyślij">
</div>
