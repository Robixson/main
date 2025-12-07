create table game
(
    id      integer not null
        constraint game_pk
            primary key autoincrement,
    title text not null,
    description text not null
);
