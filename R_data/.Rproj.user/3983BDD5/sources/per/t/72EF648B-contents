#Housekeeping ----
library(tidyverse)
library(stringr)
library(data.table)
library(jsonlite)
library(lubridate)

#Data Import ----
df <- read.csv("books_1.Best_Books_ever.csv")

horror_novels <- c(
  "The Shining",
  "It",
  "The Stand",
  "'Salem's Lot",
  "Dracula",
  "Pet Sematary",
  "The Exorcist",
  "The Haunting of Hill House",
  "Misery",
  "Carrie",
  "Frankenstein: The 1818 Text",
  "I Am Legend and Other Stories",
  "The Silence of the Lambs",
  "Rosemary's Baby",
  "Ghost Story",
  "The Tell-Tale Heart and Other Writings",
  "Interview with the Vampire",
  "Swan Song",
  "Red Dragon",
  "Watchers"
)

authors <- c(
  "Stephen King",
  "Stephen King",
  "Bram Stoker",
  "Mary Shelley",
  "Robert Bloch",
  "Stephen King",
  "William Peter Blatty",
  "Shirley Jackson",
  "Josh Malerman",
  "Bret Easton Ellis",
  "Mark Z. Danielewski",
  "Thomas Harris",
  "Max Brooks",
  "Stephen King",
  "Anne Rice",
  "M.R. Carey",
  "Cormac McCarthy",
  "Stephen King",
  "Anne Rice",
  "Jack Ketchum"
)

notright <- c("Alexa Chung", "S.T. Boston")

# df_horror <- df |> filter(grepl("Horror",genres)) 

df_horror <- df |> 
  subset(title %in% horror_novels) |> 
  filter(!author %in% notright)|>
  filter(!row_number() %in% c(21,22,23))


df_horror[c('main_author',"extra_authors")] <- str_split_fixed(df_horror$author, ", ",2)

df_horror[c('main_author',"miscInfo")] <- str_split_fixed(df_horror$main_author, "\\(",2)

df_horror  <- df_horror|>subset(select = c("title","main_author","series","genres","pages","rating","firstPublishDate","publisher","numRatings","ratingsByStars","likedPercent","awards"))


# next steps
# generate color palette
# pal <- c("7b00ff","ff6a00","fad900","08ff08","660000","5f0ca7")
notGenres <- c("Horror","Fiction","Audiobook","Novels","Literature","Poetry", "Adult","Adult Fiction","Mystery Thriller","19th Century","Science Fiction Fantasy","School","Ghost Stories","Classics", "Gothic", "Historical Fiction", "Psychological Thriller", "Religion", "Short Stories")

# export, clean dates, count awards, re-import
write_csv(df_horror,"tbc_horror.csv")
df_cleanish <- read_csv('tbc_horror.csv')
# fix genres
# calculate age


# remove horror, fiction, audiobook, novels, literature, poetry, adult,school,science fiction fantasy, mystery thriller, ghost stories,
df_tidy  <- df_cleanish |> separate_rows(genres,sep=", ")
df_tidy$genres  <-  gsub("[[:punct:]]","",df_tidy$genres)


df_horror_2 <- df_tidy %>%  
  filter(!genres %in% notGenres) |> 
  summarise(genres2 = toString(genres), .by = c(title,main_author,pages,rating,firstPublishDate,numAwards)) |> 
  mutate(cleaned_genres=str_split(genres2,', ')) |> 
  # mutate(cleaned_date=as.Date(firstPublishDate, "%m/%d%y"))
  mutate(cleaned_date=as.Date(firstPublishDate, "%m/%d/%Y"))  |> 
  mutate(age=floor(time_length(difftime(Sys.Date(),cleaned_date),"years"))) |> 
  select(-genres2, -cleaned_date)

write_json(df_horror_2, "horror_novels.json")

df_genres  <- df_tidy %>%  
  filter(!genres %in% notGenres) 

hist(df_cleaned$rating)
hist(as.numeric(df_cleaned$pages),breaks=24)
hist(df_cleaned_2$age,breaks=10)

df_genres  |> 
  group_by(genres) |> 
  summarize(count=n()) |> 
  arrange(desc(count)) |> 
  print(n=21)

df_horror_2  |> 
  group_by(numAwards) |> 
  summarize(count=n()) |> 
  arrange(desc(count))


