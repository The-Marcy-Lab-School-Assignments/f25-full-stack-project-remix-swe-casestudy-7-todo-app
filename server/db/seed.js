const bcrypt = require('bcrypt');
const pool = require('./pool');

const SALT_ROUNDS = 8;

const seed = async () => {
  // Drop tables in reverse dependency order (todos references users via FK)
  await pool.query('DROP TABLE IF EXISTS fantasy_team_players');
  await pool.query('DROP TABLE IF EXISTS fantasy_teams');
  await pool.query('DROP TABLE IF EXISTS players');
  await pool.query('DROP TABLE IF EXISTS users');

  console.log('Creating users table...');
  await pool.query(`
    CREATE TABLE users (
      user_id       SERIAL      PRIMARY KEY,
      username      TEXT UNIQUE NOT NULL,
      password_hash TEXT        NOT NULL
    )
  `);

  console.log('Creating players table...');
  await pool.query(` 
    CREATE TABLE players ( 
      player_id   SERIAL  PRIMARY KEY, 
      player_name TEXT    NOT NULL, 
      position    TEXT    NOT NULL, 
      rating      INTEGER NOT NULL, 
      club_name   TEXT    NOT NULL 
    )
  `);

  console.log('Creating fantasy teams table...');
  await pool.query(`
    CREATE TABLE fantasy_teams (
      team_id   SERIAL      PRIMARY KEY,
      user_id   INTEGER     REFERENCES users(user_id) ON DELETE CASCADE,
      team_name TEXT        NOT NULL,
      formation TEXT        NOT NULL
    )
  `);

  console.log('Creating fantasy team players table...');
  await pool.query(`
    CREATE TABLE fantasy_team_players (
      team_player_id SERIAL  PRIMARY KEY,
      team_id        INTEGER REFERENCES fantasy_teams(team_id) ON DELETE CASCADE,
      player_id      INTEGER REFERENCES players(player_id) ON DELETE CASCADE
    )
  `);

  // Hash passwords in parallel — bcrypt is slow by design (CPU-bound hashing)
  const [aliceHash, bobHash] = await Promise.all([
    bcrypt.hash('password123', SALT_ROUNDS),
    bcrypt.hash('password123', SALT_ROUNDS),
  ]);

  // RETURNING captures inserted user_ids so we don't hardcode them
  const { rows: users } = await pool.query(`
    INSERT INTO users (username, password_hash) VALUES
      ('alice', $1),
      ('bob',   $2)
    RETURNING user_id, username
  `, [aliceHash, bobHash]);

  const [alice, bob] = users;

  await pool.query(`
    INSERT INTO Players (player_name, position, rating, club_name)
    VALUES
    ('Lionel Messi', 'RW', 93, 'Inter Miami'),
    ('Cristiano Ronaldo', 'ST', 91, 'Al Nassr'),
    ('Kylian Mbappe', 'ST', 92, 'Real Madrid'),
    ('Erling Haaland', 'ST', 91, 'Manchester City'),
    ('Kevin De Bruyne', 'CM', 91, 'Manchester City'),
    ('Vinicius Junior', 'LW', 90, 'Real Madrid'),
    ('Jude Bellingham', 'CM', 90, 'Real Madrid'),
    ('Harry Kane', 'ST', 90, 'Bayern Munich'),
    ('Mohamed Salah', 'RW', 90, 'Liverpool'),
    ('Robert Lewandowski', 'ST', 89, 'Barcelona'),
    ('Neymar Jr', 'LW', 89, 'Al Hilal'),
    ('Luka Modric', 'CM', 88, 'Real Madrid'),
    ('Pedri', 'CM', 88, 'Barcelona'),
    ('Bukayo Saka', 'RW', 88, 'Arsenal'),
    ('Phil Foden', 'CAM', 88, 'Manchester City'),
    ('Rodri', 'CDM', 90, 'Manchester City'),
    ('Declan Rice', 'CDM', 87, 'Arsenal'),
    ('Martin Odegaard', 'CAM', 88, 'Arsenal'),
    ('Virgil van Dijk', 'CB', 89, 'Liverpool'),
    ('Alisson Becker', 'GK', 89, 'Liverpool'),
    ('Ederson', 'GK', 88, 'Manchester City'),
    ('Marc-Andre ter Stegen', 'GK', 89, 'Barcelona'),
    ('Thibaut Courtois', 'GK', 90, 'Real Madrid'),
    ('Antoine Griezmann', 'CF', 88, 'Atletico Madrid'),
    ('Lautaro Martinez', 'ST', 89, 'Inter Milan'),
    ('Victor Osimhen', 'ST', 88, 'Galatasaray'),
    ('Khvicha Kvaratskhelia', 'LW', 87, 'PSG'),
    ('Rafael Leao', 'LW', 87, 'AC Milan'),
    ('Bruno Fernandes', 'CAM', 87, 'Manchester United'),
    ('Casemiro', 'CDM', 86, 'Manchester United'),
    ('Marcus Rashford', 'LW', 85, 'Manchester United'),
    ('Son Heung-min', 'LW', 88, 'Tottenham Hotspur'),
    ('James Maddison', 'CAM', 85, 'Tottenham Hotspur'),
    ('Dominik Szoboszlai', 'CM', 85, 'Liverpool'),
    ('Alexis Mac Allister', 'CM', 85, 'Liverpool'),
    ('Enzo Fernandez', 'CM', 84, 'Chelsea'),
    ('Cole Palmer', 'RW', 87, 'Chelsea'),
    ('Christopher Nkunku', 'CF', 85, 'Chelsea'),
    ('Joao Felix', 'CF', 83, 'Chelsea'),
    ('Mason Mount', 'CM', 83, 'Manchester United'),
    ('Joshua Kimmich', 'CDM', 88, 'Bayern Munich'),
    ('Jamal Musiala', 'CAM', 88, 'Bayern Munich'),
    ('Alphonso Davies', 'LB', 86, 'Bayern Munich'),
    ('Thomas Muller', 'CAM', 84, 'Bayern Munich'),
    ('Kingsley Coman', 'LW', 85, 'Bayern Munich'),
    ('Serge Gnabry', 'RW', 84, 'Bayern Munich'),
    ('Dayot Upamecano', 'CB', 84, 'Bayern Munich'),
    ('Achraf Hakimi', 'RB', 87, 'PSG'),
    ('Ousmane Dembele', 'RW', 86, 'PSG'),
    ('Gianluigi Donnarumma', 'GK', 87, 'PSG'),
    ('Milan Skriniar', 'CB', 84, 'PSG'),
    ('Marquinhos', 'CB', 87, 'PSG'),
    ('Warren Zaire-Emery', 'CM', 83, 'PSG'),
    ('Joao Cancelo', 'RB', 85, 'Al Hilal'),
    ('Bernardo Silva', 'CAM', 88, 'Manchester City'),
    ('Jack Grealish', 'LW', 84, 'Manchester City'),
    ('John Stones', 'CB', 85, 'Manchester City'),
    ('Ruben Dias', 'CB', 89, 'Manchester City'),
    ('Kyle Walker', 'RB', 84, 'Manchester City'),
    ('Gabriel Martinelli', 'LW', 84, 'Arsenal'),
    ('Gabriel Jesus', 'ST', 83, 'Arsenal'),
    ('William Saliba', 'CB', 87, 'Arsenal'),
    ('Ben White', 'RB', 84, 'Arsenal'),
    ('Kai Havertz', 'CF', 84, 'Arsenal'),
    ('Frenkie de Jong', 'CM', 87, 'Barcelona'),
    ('Gavi', 'CM', 84, 'Barcelona'),
    ('Ronald Araujo', 'CB', 86, 'Barcelona'),
    ('Jules Kounde', 'RB', 85, 'Barcelona'),
    ('Raphinha', 'RW', 85, 'Barcelona'),
    ('Lamine Yamal', 'RW', 86, 'Barcelona'),
    ('Federico Valverde', 'CM', 88, 'Real Madrid'),
    ('Aurelien Tchouameni', 'CDM', 85, 'Real Madrid'),
    ('Eduardo Camavinga', 'CM', 85, 'Real Madrid'),
    ('Antonio Rudiger', 'CB', 87, 'Real Madrid'),
    ('Dani Carvajal', 'RB', 85, 'Real Madrid'),
    ('Eder Militao', 'CB', 86, 'Real Madrid'),
    ('Jan Oblak', 'GK', 88, 'Atletico Madrid'),
    ('Julian Alvarez', 'ST', 86, 'Atletico Madrid'),
    ('Memphis Depay', 'CF', 83, 'Corinthians'),
    ('Nahuel Molina', 'RB', 83, 'Atletico Madrid'),
    ('Nicolo Barella', 'CM', 87, 'Inter Milan'),
    ('Hakan Calhanoglu', 'CDM', 86, 'Inter Milan'),
    ('Marcus Thuram', 'ST', 84, 'Inter Milan'),
    ('Benjamin Pavard', 'CB', 84, 'Inter Milan'),
    ('Mike Maignan', 'GK', 87, 'AC Milan'),
    ('Theo Hernandez', 'LB', 86, 'AC Milan'),
    ('Christian Pulisic', 'RW', 84, 'AC Milan'),
    ('Tijjani Reijnders', 'CM', 84, 'AC Milan'),
    ('Dusan Vlahovic', 'ST', 85, 'Juventus'),
    ('Federico Chiesa', 'LW', 84, 'Liverpool'),
    ('Adrien Rabiot', 'CM', 83, 'Marseille'),
    ('Bremer', 'CB', 85, 'Juventus'),
    ('Paulo Dybala', 'CF', 85, 'Roma'),
    ('Romelu Lukaku', 'ST', 84, 'Napoli'),
    ('Scott McTominay', 'CM', 82, 'Napoli'),
    ('Matteo Politano', 'RW', 82, 'Napoli'),
    ('Victor Boniface', 'ST', 84, 'Bayer Leverkusen'),
    ('Florian Wirtz', 'CAM', 88, 'Bayer Leverkusen'),
    ('Jeremie Frimpong', 'RB', 84, 'Bayer Leverkusen'),
    ('Granit Xhaka', 'CDM', 84, 'Bayer Leverkusen'),
    ('Xavi Simons', 'CAM', 84, 'RB Leipzig'),
    ('Lois Openda', 'ST', 83, 'RB Leipzig'),
    ('Karim Adeyemi', 'LW', 81, 'Borussia Dortmund'),
    ('Julian Brandt', 'CAM', 84, 'Borussia Dortmund'),
    ('Niclas Fullkrug', 'ST', 82, 'West Ham United'),
    ('Gregor Kobel', 'GK', 86, 'Borussia Dortmund'),
    ('Mats Hummels', 'CB', 82, 'Roma'),
    ('David Alaba', 'CB', 84, 'Real Madrid'),
    ('Ilkay Gundogan', 'CM', 85, 'Barcelona'),
    ('Sandro Tonali', 'CDM', 85, 'Newcastle United'),
    ('Alexander Isak', 'ST', 86, 'Newcastle United'),
    ('Bruno Guimaraes', 'CM', 86, 'Newcastle United'),
    ('Kieran Trippier', 'RB', 83, 'Newcastle United'),
    ('Ollie Watkins', 'ST', 85, 'Aston Villa'),
    ('Douglas Luiz', 'CM', 84, 'Juventus'),
    ('Emiliano Martinez', 'GK', 87, 'Aston Villa'),
    ('Leon Bailey', 'RW', 82, 'Aston Villa'),
    ('Mohammed Kudus', 'RW', 83, 'West Ham United'),
    ('Jarrod Bowen', 'RW', 84, 'West Ham United'),
    ('Lucas Paqueta', 'CAM', 84, 'West Ham United'),
    ('Eberechi Eze', 'CAM', 83, 'Crystal Palace'),
    ('Michael Olise', 'RW', 84, 'Bayern Munich'),
    ('Wilfried Zaha', 'LW', 81, 'Lyon'),
    ('Takefusa Kubo', 'RW', 84, 'Real Sociedad'),
    ('Martin Zubimendi', 'CDM', 84, 'Real Sociedad'),
    ('Mikel Oyarzabal', 'LW', 84, 'Real Sociedad'),
    ('Youssef En-Nesyri', 'ST', 82, 'Fenerbahce'),
    ('Edin Dzeko', 'ST', 81, 'Fenerbahce'),
    ('Hakim Ziyech', 'RW', 81, 'Galatasaray'),
    ('Mauro Icardi', 'ST', 83, 'Galatasaray'),
    ('Anderson Talisca', 'CAM', 83, 'Al Nassr'),
    ('Sadio Mane', 'LW', 84, 'Al Nassr'),
    ('Marcelo Brozovic', 'CDM', 84, 'Al Nassr'),
    ('Karim Benzema', 'ST', 88, 'Al Ittihad'),
    ('NGolo Kante', 'CDM', 85, 'Al Ittihad'),
    ('Fabinho', 'CDM', 83, 'Al Ittihad'),
    ('Riyad Mahrez', 'RW', 84, 'Al Ahli'),
    ('Roberto Firmino', 'CF', 83, 'Al Ahli'),
    ('Kalidou Koulibaly', 'CB', 84, 'Al Hilal'),
    ('Sergej Milinkovic-Savic', 'CM', 85, 'Al Hilal'),
    ('Aleksandar Mitrovic', 'ST', 84, 'Al Hilal'),
    ('Yassine Bounou', 'GK', 84, 'Al Hilal'),
    ('Angel Di Maria', 'RW', 82, 'Benfica'),
    ('Otamendi', 'CB', 81, 'Benfica'),
    ('Pepe', 'CB', 80, 'Porto'),
    ('Joao Neves', 'CM', 82, 'PSG'),
    ('Darwin Nunez', 'ST', 84, 'Liverpool'),
    ('Luis Diaz', 'LW', 85, 'Liverpool'),
    ('Trent Alexander-Arnold', 'RB', 87, 'Liverpool'),
    ('Diogo Jota', 'CF', 84, 'Liverpool')
  `);

  await pool.query(`
    INSERT INTO fantasy_teams (user_id, team_name, formation)
    VALUES
    (1, 'Galacticos FC', '4-3-3'),
    (2, 'Premier Legends', '4-2-3-1')
    `);

  await pool.query(`
    INSERT INTO fantasy_team_players (team_id, player_id)
    VALUES
    (1, 23),
    (1, 149),
    (1, 19),
    (1, 58),
    (1, 86),
    (1, 5),
    (1, 7),
    (1, 16),
    (1, 6),
    (1, 4),
    (1, 3),

    (2,20),
    (2, 149),
    (2, 62),
    (2, 57),
    (2, 43),
    (2, 17),
    (2, 55),
    (2, 14),
    (2, 15),
    (2, 9),
    (2, 8)
    `);

  return users;
};

seed()
  .then((users) => {
    console.log('Database seeded successfully.');
    console.log(`  Users: ${users.map((u) => u.username).join(', ')}`);
  })
  .catch((err) => {
    console.error('Error seeding database:', err);
    process.exit(1);
  })
  .finally(() => pool.end());
