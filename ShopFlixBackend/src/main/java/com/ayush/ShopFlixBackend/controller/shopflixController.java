package com.ayush.ShopFlixBackend.controller;

import com.ayush.ShopFlixBackend.entity.*;
import com.ayush.ShopFlixBackend.services.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/shopflix")
public class shopflixController {


    //  Movies....
    private final movieServices MoviesServices;
    private final electronicServices ElectronicServices;
    private final beautyAndGroomingServices beautyAndGroomingServices;
    private final WomensClothServices womensClothServices;
    private final KitchenStorageServices kitchenStorageServices;

    public shopflixController(movieServices MoviesServices, electronicServices electronicServices, beautyAndGroomingServices beautyAndGroomingServices, WomensClothServices womensClothServices, KitchenStorageServices kitchenStorageServices) {
        this.MoviesServices = MoviesServices;
        ElectronicServices = electronicServices;
        this.beautyAndGroomingServices = beautyAndGroomingServices;
        this.womensClothServices = womensClothServices;
        this.kitchenStorageServices = kitchenStorageServices;
    }

    // Fetch movies with token validation
    @GetMapping("/movies")
    public Page<Movie> getMovies(@RequestParam(defaultValue = "0") int page,
                                  @RequestParam(defaultValue = "21") int size) {
        return MoviesServices.getMovies(PageRequest.of(page,size));
    }

    // Electronics...
    @GetMapping("/electronics")
    public Page<Electronics> getElectronics(@RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "20") int size) {
        return ElectronicServices.getElectronics(PageRequest.of(page, size));
    }

    // beauty and grooming...
    @GetMapping("/beautyandgroomings")
    public Page<BeautyAndGrooming> getBeautyAndGrooming(@RequestParam(defaultValue = "0") int page,
                                                        @RequestParam(defaultValue = "20") int size) {
        return beautyAndGroomingServices.getBeautyAndGrooming(PageRequest.of(page,size));
    }

    // womens cloth...
    @GetMapping("/womenscloth")
    public Page<WomensCloth> getWomensCloth(@RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "20") int size) {
        return womensClothServices.getWomensClothes(PageRequest.of(page,size));
    }

    @GetMapping("/kitchenstorage")
    public Page<KitchenStorage> getKitchenStorage(@RequestParam(defaultValue = "0") int page,
                                                  @RequestParam(defaultValue = "20") int size){
        return kitchenStorageServices.getKitchenStorage(PageRequest.of(page,size));
    }

}
