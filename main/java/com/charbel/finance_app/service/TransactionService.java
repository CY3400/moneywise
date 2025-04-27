package com.charbel.finance_app.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.charbel.finance_app.DTO.MostCountDTO;
import com.charbel.finance_app.DTO.MostDepensiveDayDTO;
import com.charbel.finance_app.DTO.TopTransactionDTO;
import com.charbel.finance_app.repository.TransactionRepository;

import java.sql.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {
    @Autowired
    private TransactionRepository transactionRepository;

    public List<TopTransactionDTO> getTop5Transactions(Integer month, Integer year) {
        List<Object[]> results = transactionRepository.findTop5(month, year);

        return results.stream().map(obj -> new TopTransactionDTO(
            (String) obj[0],   // description (String)
            ((Number) obj[1]).longValue() // amount (Long)
        )).collect(Collectors.toList());
    }

    public List<MostDepensiveDayDTO> findDailyExpensive(Integer month, Integer year){
        List<Object[]> results = transactionRepository.findDailyExpensive(month, year);

        return results.stream().map(obj -> new MostDepensiveDayDTO(
            ((Date) obj[0]).toLocalDate(),
            ((Number) obj[1]).longValue()
        )).collect(Collectors.toList());
    }

    public List<MostCountDTO> findMostCount(Integer month, Integer year){
        List<Object[]> results = transactionRepository.findMostCount(month, year);

        return results.stream().map(obj -> new MostCountDTO(
            (String) obj[0],
            (Long) obj[1]
        )).collect(Collectors.toList());
    }
}
