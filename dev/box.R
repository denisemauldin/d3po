box_data <- tibble(
  year = rep(c(1991,1992), 8),
  name = c(rep("alpha", 2), rep("alpha2", 2),
           rep("beta", 2), rep("beta2", 2),
           rep("gamma", 2), rep("gamma2", 2),
           rep("delta", 2), rep("delta2", 2)),
  value = c(15,34,17,65,10,10,40,38,5,10,20,34,50,
            43,17,35)
)

d3plus() %>%
  d3p_type("box") %>%
  d3p_data(data = box_data) %>%
  d3p_id(c("name")) %>% 
  d3p_axis(x = "year", y = "value") %>% 
  d3p_title(
    list(
      value = "Titles and Footers Example",
      sub = "Subtitles are smaller than titles."
    )
  ) %>% 
  d3p_footer(
    list(
      link = "http://www.google.com",
      value = "Click here to search Google"
    )
  )
