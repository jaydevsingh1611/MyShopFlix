package com.ayush.ShopFlixBackend;


import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;

@SpringBootApplication
@EnableElasticsearchRepositories(basePackages = "com.ayush.ShopFlixBackend.Repo")
public class ShopFlixBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(ShopFlixBackendApplication.class, args);
	}
}
