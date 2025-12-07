<?php

/** @var \App\Model\Game $game */
/** @var \App\Service\Router $router */

$title = "{$game->getTitle()} ({$game->getId()})";
$bodyClass = 'show';

ob_start(); ?>
    <h1><?= $game->getTitle() ?></h1>
    <article>
        <?= $game->getDescription() ?>
    </article>

    <ul class="action-list">
        <li> <a href="<?= $router->generatePath('game-index') ?>">Powrót</a></li>
        <li><a href="<?= $router->generatePath('game-edit', ['id'=> $game->getId()]) ?>">Edycja</a></li>
    </ul>
<?php $main = ob_get_clean();

include __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'base.html.php';
