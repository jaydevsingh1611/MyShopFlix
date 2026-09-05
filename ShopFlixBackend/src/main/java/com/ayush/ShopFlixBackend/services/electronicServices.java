package com.ayush.ShopFlixBackend.services;

import com.ayush.ShopFlixBackend.Repo.productRepo;
import com.ayush.ShopFlixBackend.entity.Product;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class productServices {

    private final productRepo repo;

    public productServices(productRepo repo) {
        this.repo = repo;
    }

    @Transactional
    public Product saveProduct(Product product) {
        return repo.save(product);
    }

    public List<Product> getAllProducts() {
        return repo.findAll();
    }

    public Optional<Product> getProductById(Long id) {
        return repo.findById(id);
    }

    @Transactional
    public void deleteProduct(Long id) {
        repo.deleteById(id);
    }
}
