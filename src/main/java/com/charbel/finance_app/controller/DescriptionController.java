package com.charbel.finance_app.controller;

import com.charbel.finance_app.model.Description;
import com.charbel.finance_app.repository.DescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/description")
public class DescriptionController {

    @Autowired
    private DescriptionRepository descriptionRepository;

    @PostMapping
    public Description addDescription(@RequestBody Description description) {
        return descriptionRepository.save(description);
    }

    @GetMapping
    public List<Description> getAllDescriptions() {
        return descriptionRepository.findAll();
    }

    @GetMapping("/{id}")
    public Description getDescriptionById(@PathVariable Long id) {
        return descriptionRepository.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public Description updateDescription(@PathVariable Long id, @RequestBody Description descriptionDetails) {
    Description description = descriptionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Description not found with id " + id));

    description.setDescription(descriptionDetails.getDescription());
    description.setType(descriptionDetails.getType());

    return descriptionRepository.save(description);
    }

    @DeleteMapping("/{id}")
    public String deleteDescription(@PathVariable Long id) {
        Description description = descriptionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Description not found with id " + id));
        descriptionRepository.delete(description);
        return "Description with ID " + id + " deleted successfully.";
    }


}
