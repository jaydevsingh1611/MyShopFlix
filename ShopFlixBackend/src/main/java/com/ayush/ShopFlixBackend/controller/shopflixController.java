package com.ayush.ShopFlixBackend.controller;

import com.ayush.ShopFlixBackend.entity.Movie;
import com.ayush.ShopFlixBackend.services.movieServices;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/shopflix")
public class moviesController {

    private final movieServices services;

    public moviesController(movieServices services) {
        this.services = services;
    }

    // Fetch movies with token validation
    @GetMapping("/movies")
    public List<Movie> getAllMovies() {
        return services.getAllMovie();
    }


}
