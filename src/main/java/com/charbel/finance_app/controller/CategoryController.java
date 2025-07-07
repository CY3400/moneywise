package com.charbel.finance_app.controller;

import com.charbel.finance_app.model.Category;
import com.charbel.finance_app.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/category")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @PostMapping
    public Category addCategory(@RequestBody Category category) {
        return categoryRepository.save(category);
    }

    @GetMapping
    public List<Category> getAllCategorys() {
        return categoryRepository.findAll();
    }

    @GetMapping("/active")
    public List<Category> findAllActives() {
        return categoryRepository.findAllActives();
    }
    

    @GetMapping("/{id}")
    public Category getCategoryById(@PathVariable Long id) {
        return categoryRepository.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public Category updateCategory(@PathVariable Long id, @RequestBody Category categoryDetails) {
    Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Category not found with id " + id));

    category.setDescription(categoryDetails.getDescription());
    category.setStatus(categoryDetails.getStatus());

    return categoryRepository.save(category);
    }

    @DeleteMapping("/{id}")
    public String deleteCategory(@PathVariable Long id) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Category not found with id " + id));
        categoryRepository.delete(category);
        return "Category with ID " + id + " deleted successfully.";
    }

    @GetMapping("/filter")
    public List<Category> findDescriptionByNameOrType(
        @RequestParam(required = false) String description) {
        return categoryRepository.findCategoryByName(description);
    }
}
