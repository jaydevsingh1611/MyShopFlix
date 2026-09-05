package com.ayush.ShopFlixBackend.Repo;

import com.ayush.ShopFlixBackend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface productRepo extends JpaRepository<Product,Long> {
}
