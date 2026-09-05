package com.ayush.ShopFlixBackend.services;

import com.ayush.ShopFlixBackend.Repo.electronictRepo;
import com.ayush.ShopFlixBackend.Repo.movieRepo;
import org.springframework.stereotype.Service;

import  com.ayush.ShopFlixBackend.electronictRepo;


@Service
public class UserItemService  {

    private final electronictRepo electricrepo;

    private final movieRepo movierepo;

    public UserItemService (electronictRepo electricrepo, movieRepo movierepo) {
        this.electricrepo = electricrepo;
        this.movierepo = movierepo;
    }





}
