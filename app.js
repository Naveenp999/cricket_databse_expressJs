const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const express = require('express')
const app = express()

const path = require('path')
const filepath = path.join(__dirname, 'cricketTeam.db')

app.use(express.json());

let db = null

const EstablishDbConnection = async () => {
  try {
    db = await open({
      filename: filepath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log(`Server Started Running`)
    })
  } catch (error) {
    console.log(`DB error ${error}`)
  }
}

EstablishDbConnection()

function getDecodedData(element) {
  const {player_id, player_name, jersey_number, role} = element
  return {
    playerId: player_id,
    playerName: player_name,
    jerseyNumber: jersey_number,
    role: role,
  }
}

app.get('/players/', async (request, response) => {
  const query = `SELECT 
                  *
                 FROM
                 cricket_team;
                  `
  const data = await db.all(query)
  const newData = data.map(element => getDecodedData(element))
  response.send(newData)
})

app.post('/players/', async (request, response) => {
  const p = request.body
  const {playerName, jerseyNumber, role} = p
  const query = `INSERT INTO
                  cricket_team (player_name,jersey_number,role)
                 VALUES 
                  ('${playerName}',${jerseyNumber},'${role}');`
  const returnData = await db.run(query)
  response.send('Player Added to Team')
})

app.put('/players/:playerId', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const {playerId} = request.params
  const query = `UPDATE 
                  cricket_team
                 SET
                  player_name = '${playerName}',
                  jersey_number = ${jerseyNumber},
                  role = '${role}'
                 WHERE 
                  player_id = ${playerId};`
  await db.run(query)
  response.send('Player Details Updated')
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const query = `SELECT 
                  *
                 FROM 
                  cricket_team
                 WHERE 
                  player_id = ${playerId};`
  const data = await db.get(query)
  const newData = getDecodedData(data)
  response.send(newData)
})

app.delete('/players/:playerId/',async(request,response) => {
  const {playerId} = request.params
  const query =  
  `DELETE FROM  
    cricket_team
   WHERE 
    player_id = ${playerId};
  `
  await db.run(query);
  response.send('Player Removed');
})

module.exports = app
