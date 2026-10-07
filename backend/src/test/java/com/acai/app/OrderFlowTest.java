package com.acai.app;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

// Banco novo a cada teste, para um não enxergar os pedidos do outro.
@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:${random.uuid}")
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class OrderFlowTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;

    String token;

    @BeforeEach
    void login() throws Exception {
        String body = mvc.perform(post("/api/owner/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"password\":\"acai123\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        token = "Bearer " + json.readTree(body).get("token").asText();
    }

    @Test
    void cardapioTemOsDadosDeExemplo() throws Exception {
        mvc.perform(get("/api/menu"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sizes", hasSize(3)))
                .andExpect(jsonPath("$.products", hasSize(4)));
    }

    @Test
    void pedidoCalculaTotalNoServidorENaoDuplica() throws Exception {
        String order = """
                {"customerName":"Henry","requestId":"abc","items":[
                  {"kind":"MONTADO","sizeId":"s500","complementIds":["banana"],"extraIds":["leite-po"],"quantity":2},
                  {"kind":"PRONTO","productId":"classico","quantity":1}]}
                """;
        JsonNode first = postOrder(order);
        JsonNode second = postOrder(order);

        org.assertj.core.api.Assertions.assertThat(first.get("total").decimalValue()).isEqualByComparingTo("72");
        org.assertj.core.api.Assertions.assertThat(first.get("number").asInt()).isEqualTo(1);
        org.assertj.core.api.Assertions.assertThat(second.get("id").asText()).isEqualTo(first.get("id").asText());
    }

    @Test
    void insumoDesligadoDeixaProntoEsgotado() throws Exception {
        mvc.perform(put("/api/owner/ingredients/morango").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Morango\",\"type\":\"COMPLEMENTO\",\"extraPrice\":0,\"available\":false}"))
                .andExpect(status().isOk());

        mvc.perform(post("/api/orders").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"customerName\":\"Ana\",\"items\":[{\"kind\":\"PRONTO\",\"productId\":\"tropical\",\"quantity\":1}]}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Tropical está esgotado"));
    }

    @Test
    void limiteDeComplementosEValidadoNoServidor() throws Exception {
        mvc.perform(post("/api/orders").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"customerName\":\"Ana\",\"items\":[{\"kind\":\"MONTADO\",\"sizeId\":\"s300\","
                                + "\"complementIds\":[\"banana\",\"morango\",\"granola\",\"kiwi\"],\"extraIds\":[],\"quantity\":1}]}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Escolha até 3 complementos"));
    }

    @Test
    void painelExigeLoginEStatusSegueAOrdem() throws Exception {
        mvc.perform(get("/api/owner/orders")).andExpect(status().isUnauthorized());

        String id = postOrder("{\"customerName\":\"Ana\",\"items\":[{\"kind\":\"PRONTO\",\"productId\":\"classico\",\"quantity\":1}]}")
                .get("id").asText();

        mvc.perform(patch("/api/owner/orders/" + id + "/status").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"ENTREGUE\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(patch("/api/owner/orders/" + id + "/status").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"PRONTO\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PRONTO"));
        mvc.perform(get("/api/owner/orders").header("Authorization", token))
                .andExpect(jsonPath("$", hasSize(1)));
    }

    private JsonNode postOrder(String body) throws Exception {
        String response = mvc.perform(post("/api/orders").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return json.readTree(response);
    }
}
