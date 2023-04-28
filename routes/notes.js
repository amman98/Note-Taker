const notes = require("express").Router();
const fs = require("fs");
const util = require("util");
const { v4: uuidv4 } = require('uuid');
const { readAndAppend, readFromFile, writeToFile } = require('../helpers/fsUtils');

// GET Route returns all saved notes
notes.get("/notes", (req, res) => {
    readFromFile("./db/db.json").then((data) => res.json(JSON.parse(data)));
});

// POST Route adds a note and saves it
notes.post("/notes", (req, res) => {
    const {title, text} = req.body;

    if(title || text) {
        // creates a note object
        const newNote = {
            title,
            text,
            id: uuidv4() // creates a random id
        };

        readAndAppend(newNote, './db/db.json');

        const response = {
            status: 'success',
            body: newNote
        };

        res.json(response);
    } else {
        res.json('Error in posting note');
    }
});

// DELETE Route removes a note based on the id selected
notes.delete("/notes/:id", (req, res) => {
    const noteId = req.params.id; // grab id from api call
    readFromFile("./db/db.json")
        .then((data) => JSON.parse(data))
        .then((json) => {
            let hasId = false;
            
            // check if id exists in json
            for(let i = 0; i < json.length; i++) {
                if(json[i].id === noteId) {
                    hasId = true;
                    break;
                }
            }

            //  write to file only if id exists
            if(hasId) {
                // create new array discluding the note with the id being deleted
                const result = json.filter((note) => note.id !== noteId);

                // write new resulting data to our json file
                writeToFile('./db/db.json', result);

                res.json(result);
            }
            else {
                res.json('Error in deleting note'); // give error message as id isn't valid
            }
        })
});

module.exports = notes;