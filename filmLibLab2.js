"use strict";
const dayjs= require("dayjs");
let now=dayjs().format("YYYY-MM-DD");


const sqlite = require('sqlite3');
const db = new sqlite.Database('films.db',
    (err) => { if (err) throw err; });




function Film(id,title,favorite,date,rating)
{
    this.id=id;
    this.title=title;
    this.favorite=(favorite)? favorite : false;
    this.date=date;
    this.rating=(rating>=1 && rating<=5)? rating : undefined;
    this.printFilm= function(){return `Id: ${this.id} Title: ${this.title} Favourite: ${this.favorite} Watch date:  ${this.date}, Score: ${this.rating} `}

}

function FilmLibrary()
{
    this.films=[];
    this.favoriteFilms=[];
    this.todayWatched=[];
    this.WatchedEarlierThen=[];
    this.RatingsGreaterThen=[];
    this.MatchedFilms=[];

    this.addNewFilm = async (e) => {
        return new Promise((resolve, reject) => {
          const sql = 'INSERT INTO films(title, favorite, watchdate,rating) VALUES(?, ?,DATE(?), ?)';
          db.run(sql, [e.title, e.favorite, e.date.format('YYYY-MM-DD'),e.rating], function (err) {
            if (err)
            { reject(err);
                console.log("INSERT FAILURE!")
            }
            else 
            {   
                console.log("Successfull Insert")
                resolve("Done");
            }
          });
        });
      };


      this.deleteFilm = async (id) => {
        return new Promise((resolve, reject) => {
          const sql = 'DELETE FROM films WHERE films.id=?';
          db.run(sql,[id], function (err) {
            if (err)
            { reject(err);
                console.log("DELETE FAILURE!")
            }
            else 
            {   console.log(id);
                console.log("Successfull Delte");
                resolve("Done");
            }
          });
        });
      };

      this.deleteFilmDate = async (e) => {
        return new Promise((resolve, reject) => {
          const sql = 'UPDATE films SET watchdate = NULL WHERE watchdate IS NOT NULL;';
          db.run(sql,[e], function (err) {
            if (err)
            { reject(err);
                console.log("DATE DELETE FAILURE!")
            }
            else 
            {   
                
                console.log("Successfull Date Delte");
                resolve("Done");
            }
          });
        });
      };

    this.printAll=async function printAllFilms() {
        return new Promise( (resolve, reject) => {
            db.all('select * from films',
                (err, rows) => {
                    if(err)
                         reject(err);
                    else {
                        this.films = rows.map(row => new Film(row.id, row.title, row.favorite,dayjs(row.date).format("YYYY-MM-DD"), row.rating));
                        resolve(this.films);
                    }
                }) ;            
            }) ;
    }
    
    this.printFavorite=async function printFavoriteFilms() {
        return new Promise( (resolve, reject) => {
            db.all('select * from films where films.favorite=1',
                (err, rows) => {
                    if(err)
                         reject(err);
                    else {
                        this.favoriteFilms = rows.map(row => new Film(row.id, row.title, row.favorite,dayjs(row.date).format("YYYY-MM-DD"), row.rating));
                        resolve(this.favoriteFilms);
                    }
                }) ;            
            }) ;
    }
    
    
    this.printWatchedToday=async function printWatched() {
        return new Promise( (resolve, reject) => {
            const query='select * from films where films.watchdate=?';
            db.all(query,[now],
                (err, rows) => {
                    if(err)
                         reject(err);
                    else {
                        this.todayWatched = rows.map(row => new Film(row.id, row.title, row.favorite,dayjs(row.date).format("YYYY-MM-DD"), row.rating));
                        resolve(this.todayWatched);
                    }
                }) ;            
            }) ;
    }
    
    
    this.printEarlierThen=async function printEarlier(thedate) {
        return new Promise( (resolve, reject) => {
            const query='select * from films where films.watchdate<?';
            db.all(query,[thedate],
                (err, rows) => {
                    if(err)
                         reject(err);
                    else {
                        this.WatchedEarlierThen = rows.map(row => new Film(row.id, row.title, row.favorite,dayjs(row.date).format("YYYY-MM-DD"), row.rating));
                        resolve(this.WatchedEarlierThen);
                    }
                }) ;            
            }) ;
    }
    
    
    this.printRating=async function printRatingGreaterThen(therating) {
        return new Promise( (resolve, reject) => {
            const query='select * from films where films.rating>?';
            db.all(query,[therating],
                (err, rows) => {
                    if(err)
                         reject(err);
                    else {
                        this.RatingsGreaterThen= rows.map(row => new Film(row.id, row.title, row.favorite,dayjs(row.date).format("YYYY-MM-DD"), row.rating));
                        resolve(this.RatingsGreaterThen);
                    }
                }) ;            
            }) ;
    }
    
    
    this.printMatch=async function printMatchFilms(thestring) {
        return new Promise( (resolve, reject) => {
            const query="select * from films where instr(films.title, ?) > 0";
            db.all(query,[thestring],
                (err, rows) => {
                    if(err)
                         reject(err);
                    else {
                        this.MatchedFilms= rows.map(row => new Film(row.id, row.title, row.favorite,dayjs(row.date).format("YYYY-MM-DD"), row.rating));
                        resolve(this.MatchedFilms);
                    }
                }) ;            
            }) ;
    }
    
    
}


const f=new FilmLibrary();
const film1 = new Film(-1,"Kill Bill",true,dayjs('2023-03-18'),5);

async function main() {
            
         await f.printAll(); 
         await f.printFavorite();
         await f.printWatchedToday();
         await f.printEarlierThen("2023-03-21")
         await f.printRating(3);
         await f.printMatch("G");    
         await f.addNewFilm(film1);  
         await f.deleteFilm(4);   
         await f.deleteFilmDate();
    
    return "ok"  ;
}

main().then(
    ()=>{
    db.close();
    console.log("---All films----");f.films.forEach((e)=>console.log(e.printFilm()));
    console.log("---Favorite Films---");f.favoriteFilms.forEach((e)=>console.log(e.printFilm()));
    console.log("---Today Watched Films---");(f.todayWatched.length>0)? f.todayWatched.forEach((e)=>console.log(e.printFilm())) : console.log("Non hai guardato film oggi");
    console.log("---Watched Earlier Then---"); (f.WatchedEarlierThen.length>0)? f.WatchedEarlierThen.forEach((e)=>console.log(e.printFilm())):console.log("Non hai guardato film prima della data richiesta");
    console.log("---Rating Greater Then---");(f.RatingsGreaterThen.length>0)?f.RatingsGreaterThen.forEach((e)=>console.log(e.printFilm())): console.log("Non ci sono film con un rating maggiore di quello richiesto");
    console.log("---Films That Match The String");(f.MatchedFilms.length>0)?f.MatchedFilms.forEach((e)=>console.log(e.printFilm())):console.log("Non ci sono titoli dei film che corrispondono a questa stringa");  
    
}
)



