const { initializeDatabase } = require('./db/db.connect');
const Movie = require('./models/movie.models');
const cors = require('cors');

const express = require('express');

const app = express();
const PORT = 3000;

app.use(express.json());

app.listen(PORT, () => console.log('Server is running on port', PORT));
const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

initializeDatabase();
app.get('/', (req, res) => console.log('Hello, express'));

async function createMovie(newMovie) {
  try {
    const movie = new Movie(newMovie);
    const saveMovie = await movie.save();
    // console.log('New movie data: ', saveMovie);
    return saveMovie;
  } catch (error) {
    throw error;
  }
}

app.post('/movies', async (req, res) => {
  try {
    //if want to add backend validation add here like in req.body all required keys are present in try block - normally we do validation in frontend too
    const savedMovie = await createMovie(req.body);
    res
      .status(201)
      .json({ message: 'Movie added successfully.', movie: savedMovie });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add movie' });
  }
});

//find movie with x title - return single object
async function readMovieByTitle(movieTitle) {
  try {
    const movie = await Movie.findOne({ title: movieTitle });
    // console.log(movie);
    return movie;
  } catch (error) {
    throw error;
  }
}
//run this function with help of api calls. will write routes and based on api call and get the func data.
app.get('/movies/:title', async (req, res) => {
  try {
    const movie = await readMovieByTitle(req.params.title);
    if (movie) {
      res.json(movie);
    } else {
      res.status(404).json({ error: 'Movie not found.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movie.' });
    //if error occur in api call
  }
});

//get all movies - return array
async function readAllMovies() {
  try {
    const allMovies = await Movie.find();
    // console.log(allMovies);
    return allMovies;
  } catch (error) {
    console.log(error);
  }
}

app.get('/movies', async (req, res) => {
  try {
    const movies = await readAllMovies();
    if (movies.length != 0) {
      res.json(movies);
    } else {
      res.status(404).json({ error: 'No movies found.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movies.' });
  }
});

//get movie by director name - returns array if condition satisfies
async function readMovieByDirector(directorName) {
  try {
    const movieByDirector = await Movie.find({ director: directorName });
    // console.log(movieByDirector);
    return movieByDirector;
  } catch (error) {
    console.log(error);
  }
}

//already used /movies/:title, can't use same even if :directorName, use diff router
app.get('/movies/director/:directorName', async (req, res) => {
  try {
    const movies = await readMovieByDirector(req.params.directorName);
    if (movies.length != 0) {
      res.json(movies);
    } else {
      res.status(404).json({ error: 'No movies found.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movie.' });
  }
});

async function readMovieByGenre(genreName) {
  try {
    const movieByGenre = await Movie.find({ genre: genreName });
    return movieByGenre;
  } catch (error) {
    console.log(error);
  }
}

app.get('/movies/genres/:genreName', async (req, res) => {
  try {
    const movies = await readMovieByGenre(req.params.genreName);
    if (movies.length != 0) {
      res.json(movies);
    } else {
      res.status(404).json({ error: 'No movies found.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movie.' });
  }
});

async function deleteMovie(movieId) {
  try {
    const deletedMovie = await Movie.findByIdAndDelete(movieId);
    return deletedMovie;
  } catch (error) {
    console.log(error);
  }
}

app.delete('/movies/:movieId', async (req, res) => {
  try {
    const deletedMovie = await deleteMovie(req.params.movieId);
    if (deletedMovie) {
      res.status(200).json({ message: 'Movie deleted successfully.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete a movie.' });
  }
});

async function updateMovie(movieId, dataToUpdate) {
  try {
    const updatedMovie = await Movie.findByIdAndUpdate(movieId, dataToUpdate, {
      new: true,
    });
    return updatedMovie;
  } catch (error) {
    console.log(error);
  }
}

app.post('/movies/:movieId', async (req, res) => {
  try {
    const updatedMovie = await updateMovie(req.params.movieId, req.body);
    if (updatedMovie) {
      res
        .status(200)
        .json({ message: 'Movie updated successfully.', movie: updatedMovie });
    } else {
      res.status(404).json({ error: 'Movie not found.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update a movie.' });
  }
});
