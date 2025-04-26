# This files contains your custom actions which can be used to run
# custom Python code.
#
# See this guide on how to implement these action:
# https://rasa.com/docs/rasa/custom-actions


# This is a simple example for a custom action which utters "Hello World!"

# from typing import Any, Text, Dict, List
#
# from rasa_sdk import Action, Tracker
# from rasa_sdk.executor import CollectingDispatcher
#
#
# class ActionHelloWorld(Action):
#
#     def name(self) -> Text:
#         return "action_hello_world"
#
#     def run(self, dispatcher: CollectingDispatcher,
#             tracker: Tracker,
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#         dispatcher.utter_message(text="Hello World!")
#
#         return []

from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from pymongo import MongoClient
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
import nltk
from nltk.corpus import stopwords

# Télécharger les ressources NLTK nécessaires (à exécuter une seule fois)
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

class ActionGetAnswer(Action):
    def name(self) -> Text:
        return "action_get_answer"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # Connexion à MongoDB
        client = MongoClient("mongodb+srv://hajar:kho123@cluster0.fvmnkff.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        db = client["questionDB"]
        collection = db["questionAnswer"]

        # Récupérer la question de l'utilisateur
        user_question = tracker.latest_message.get("text")
        
        # Recherche exacte d'abord
        exact_match = collection.find_one({"question": user_question})
        if exact_match:
            dispatcher.utter_message(exact_match["answer"])
            return []
        
        # Si pas de correspondance exacte, utiliser une recherche sémantique
        # Récupérer toutes les questions de la base de données
        all_docs = list(collection.find())
        if not all_docs:
            dispatcher.utter_message("Désolé, je n'ai pas trouvé une réponse à cette question.")
            return []
            
        # Préparer les questions pour la comparaison
        all_questions = [doc["question"] for doc in all_docs]
        
        # Prétraitement des questions
        processed_questions = [self.preprocess_text(q) for q in all_questions]
        processed_user_question = self.preprocess_text(user_question)
        
        # Vectorisation TF-IDF
        vectorizer = TfidfVectorizer()
        try:
            # Ajouter la question de l'utilisateur à la liste pour la vectorisation
            all_texts = processed_questions + [processed_user_question]
            tfidf_matrix = vectorizer.fit_transform(all_texts)
            
            # Calculer la similarité cosinus
            user_vector = tfidf_matrix[-1]  # Vecteur de la question de l'utilisateur
            db_vectors = tfidf_matrix[:-1]  # Vecteurs des questions de la base de données
            
            similarities = cosine_similarity(user_vector, db_vectors)[0]
            
            # Trouver l'index de la question la plus similaire
            best_match_idx = similarities.argmax()
            similarity_score = similarities[best_match_idx]
            
            # Définir un seuil de similarité
            threshold = 0.3
            
            if similarity_score >= threshold:
                best_match = all_docs[best_match_idx]
                dispatcher.utter_message(best_match["answer"])
            else:
                dispatcher.utter_message("Désolé, je n'ai pas trouvé une réponse à cette question.")
        except Exception as e:
            print(f"Erreur lors de la recherche sémantique: {e}")
            dispatcher.utter_message("Désolé, je n'ai pas pu traiter votre question. Veuillez réessayer.")
            
        return []
    
    def preprocess_text(self, text: Text) -> Text:
        """Prétraite le texte pour améliorer la comparaison"""
        if not text:
            return ""
            
        # Convertir en minuscules
        text = text.lower()
        
        # Supprimer la ponctuation et les caractères spéciaux
        text = re.sub(r'[^\w\s]', '', text)
        
        # Supprimer les mots vides en français
        try:
            stop_words = set(stopwords.words('french'))
            words = text.split()
            words = [word for word in words if word not in stop_words]
            text = ' '.join(words)
        except:
            # En cas d'erreur avec les stopwords
            pass
            
        return text