import os
from datetime import date


#Name codes for the assignments
ASSIGN = ["HAB","TSNE","KNN","NB","LR","SGD","SVM","DT","RF","KMEAN","SVD","MLP","CNN","LSTM","CANCER","TAXI","MLWARE",
            "NETFLIX","STACK","QUORA","HumanAR","AIRBNB","FAECBOOK","CharRNN","AD-CLK","SELF-DRIVING","CS1","CS2","BLG1","BLG2","OA1","OA2"]

#path to chromedriver
PATH_TO_DRIVER_EXE = r"C:\Users\arun\Desktop\Classroom_tool-20181014T093320Z-001\Classroom_tool\chromedriver.exe"

#folder to store the output excels
STORE_FOLDER = os.path.join(r"C:\Users\arun\Desktop\student_info\output_excels",str(date.today()))

# Credentials of classroom
LOGIN_PATH = "https://accounts.google.com/signin/v2/identifier?service=classroom&passive=1209600&continue=https%3A%2F%2Fclassroom.google.com%2F%3Femr%3D0&followup=https%3A%2F%2Fclassroom.google.com%2F%3Femr%3D0&flowName=GlifWebSignIn&flowEntry=ServiceLogin"
USER_ID = "appliedaicourse@gmail.com"
PASSWORD = "24hrsla#31"
ADMIN_NAME = "Applied AI Course"

# Credentials of mail
fromMailID = 'appliedaicourse@gmail.com'
toMailID = fromMailID
mail_password = '24hrsla#31'

# if manual login is true then you'd have to enter the mail and password details
MANUAL_LOGIN = False