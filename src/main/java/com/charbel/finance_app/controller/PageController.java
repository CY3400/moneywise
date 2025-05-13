package com.charbel.finance_app.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping("/Types_Gains_Dépenses")
    public String showDescriptionPage() {
        return "forward:/Pages/description.html";
    }
}
