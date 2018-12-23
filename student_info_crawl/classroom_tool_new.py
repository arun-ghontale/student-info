from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from datetime import datetime
from bs4 import BeautifulSoup
from dateutil import parser as dtparser
from datetime import date
import time
from time import gmtime, strftime
import re
import csv
import copy
import pandas as pd
import os
import sys
import smtplib

from argparse import ArgumentParser
from classroom_args import *
# create a directory if it doesn't exist


def assure_path_exists(path):
    print(os.path.exists(path))
    if not os.path.exists(path):
        os.makedirs(path)
        print("File created")
    else:
        print("File exists")

# Email notification definition

# For the first time open this link from your mail id and allow permissions
# https://www.google.com/settings/security/lesssecureapps


def send_email(subject, body):

    FROM = fromMailID
    #TO = recipient if isinstance(recipient, list) else [recipient]
    TO = toMailID

    SUBJECT = subject
    TEXT = body

    # Prepare actual message
    message = """From: %s\nTo: %s\nSubject: %s\n\n%s
    """ % (FROM, TO, SUBJECT, TEXT)
    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.ehlo()
        server.starttls()
        server.login(FROM, mail_password)
        server.sendmail(FROM, TO, message)
        server.close()
        print('successfully sent the mail')
    except:
        print("failed to send mail")

# Getting the latest submission


def get_latest_submission(browser):
    html_source = browser.page_source
    soup = BeautifulSoup(html_source, "lxml")
    try:
        alertDialog = soup.find('div', {"role": "alertdialog"})
        alertTable_body = alertDialog.find('tbody')
        # print("="*100)
        alertData = []
        rows = alertTable_body.find_all('tr')
        for i, row in enumerate(rows):
            cols = row.find_all('td')
            cols = [ele.text.strip() for ele in cols]
            # print("\n\n\n",i,cols)
            alertData.append([ele for ele in cols if ele])
        resub_count = sum(alertData, []).count(
            'Turned in late')+sum(alertData, []).count('Turned in')
        # print("number of resubmissions", resub_count)
        # print("="*100)

        firstSubmissionTime = dtparser.parse(alertData[-1][1])
        latestSubmissionTime = alertData[0][1]
        latestSubmissionTime = dtparser.parse(latestSubmissionTime)

        return latestSubmissionTime, resub_count, firstSubmissionTime

    except Exception as e:
        print(e, "LATEST_SUB_ERROR LATEST_SUB_ERROR LATEST_SUB_ERROR LATEST_SUB_ERROR")
        time.sleep(3)
        return get_latest_submission(browser)


# click on see history
def see_hist_JS_action(browser):
    try:

        html_source = browser.page_source
        soup = BeautifulSoup(html_source, "lxml")

        seeHist = soup.find(text="(See history)").findParent()
        seeHistJS = dict(seeHist.attrs).get('jsaction')
        seeHist_Xpath = "//div[contains(@jsaction, " + "'" + seeHistJS + "')]"

        seeHistoryButton = browser.find_element_by_xpath(seeHist_Xpath)
        seeHistoryButton.click()

        return soup

    except Exception as e:
        print(e, "SEE_HIST_ERROR SEE_HIST_ERROR SEE_HIST_ERROR SEE_HIST_ERROR")
        time.sleep(3)
        return see_hist_JS_action(browser)


# Returns the type of submission
def compare(url, brows=None):

    output = []
    browser.get(url)
    time.sleep(10)
    soup = see_hist_JS_action(browser)
    time.sleep(1)
    browser.refresh
    latestSubmissionTime, resub_count, firstSubmissionTime = get_latest_submission(
        browser)

    ##################################################################
    # TimeStamp Retrieval from Comments

    commentsTimeList = []
    for link in soup.findAll('a', attrs={'aria-label': re.compile("Comment posted by")}):
        commentsTimeList.append([link.text, link.next_sibling.text])

    try:
        # take the last admin comment so -1.
        index = [i for i, lst in enumerate(
            commentsTimeList) if ADMIN_NAME in lst][-1]
    except IndexError:
        index = ""

    ###############################latest active time####################

    latestActiveTime = latestSubmissionTime
    StudentCommentTimes = [lst[1] for i, lst in enumerate(
        commentsTimeList) if ADMIN_NAME not in lst]
    if StudentCommentTimes:
        if dtparser.parse(StudentCommentTimes[-1].split('–')[0]) > latestSubmissionTime:
            latestActiveTime = dtparser.parse(
                StudentCommentTimes[-1].split('–')[0])

    print("The latest active time", latestActiveTime)

    ###############################latest active time####################

    ##################################################################
    # TimeStamp Comparison

    # output is not required as we just need student information
    # if index != "":
    #     if commentsTimeList[-1][0] != ADMIN_NAME:

    #         latestStudentCommentTime = commentsTimeList[index][1].split("–")[0]
    #         latestStudentCommentTime = dtparser.parse(latestStudentCommentTime)

    #         if latestSubmissionTime >= latestStudentCommentTime:
    #             output.append([True,"Resubmission"])
    #         else:
    #             output.append([True,"Comment"])

    #     else:
    #         latestCommentTime = commentsTimeList[index][1].split("–")[0]
    #         latestCommentTime = dtparser.parse(latestCommentTime)

    #         # print(f"\n\n latest submission time : {latestSubmissionTime} \n latest comment time : {latestCommentTime} \n\n")
    #         output.append([(latestSubmissionTime > latestCommentTime),"Resubmission"])
    #         # print(output)

    # else:
    #     output.append([True,"New submission"])

    return(resub_count, latestSubmissionTime, firstSubmissionTime, latestActiveTime)

# get the names of the students


def get_student_names(soup):
    names_comments_data = []

    table = soup.find('table', attrs={'aria-label': 'Students'})
    table_body = table.find('tbody')

    rows = table_body.find_all('tr')
    for row in rows:
        cols = row.find_all('td')
        cols = [ele.text.strip() for ele in cols]
        names_comments_data.append([ele for ele in cols if ele])

    for i in range(len(names_comments_data)):
        if(names_comments_data[i]):
            names_comments_data[i] = str(names_comments_data[i][0])

    # Removing empty string from the list
    names_comments_data = list(filter(None, names_comments_data))

    return names_comments_data


def get_student_classroom_links(soup):
    links = []

    import re
    for link in soup.findAll('a', attrs={'href': re.compile("/student/")}):
        links.append(link.get('href'))

    # Creaing proper links
    for i in range(len(links)):
        links[i] = "https://classroom.google.com" + links[i]

    # print(links[:10])
    return links


def get_submissions_count(names_comments_data):
    try:
        submitted_index_start = names_comments_data.index("Turned in") + 1
    except ValueError:
        return 0, 0, 0, False

    try:
        submitted_index_end = names_comments_data.index("Assigned") - 1
    except ValueError:
        submitted_index_end = len(names_comments_data) - 1

    submissions_count = submitted_index_end - submitted_index_start + 1

    return submissions_count, submitted_index_start, submitted_index_end, True


def get_dataframe(notify):
    df = pd.DataFrame(columns=["assignment Name", "student name", "link", "resub_count", "Latest submission Time",
                               "First submission Time", "Latest active Time", "Done status"])
    for ind, every in enumerate(notify):
        df.loc[ind] = [every["assignment Name"], every["student name"], every["link"], every["resub_count"],
                       every["Latest submission Time"], every["First submission Time"], every["Latest active Time"],
                       every["Done status"]]
    return df


def check_assignment(classroom_name, classroom_type, assignment_code=[]):
    print(STORE_FOLDER)
    assure_path_exists(STORE_FOLDER)
    file_name = os.path.join(
        STORE_FOLDER, classroom_type+str(datetime.now().strftime('_%H_%M_'))+".xlsx")
    sheets_created = []
    with pd.ExcelWriter(file_name, engine='xlsxwriter') as writer:

        if assignment_code:
            run_planets = [ASSIGN.index(every) for every in assignment_code]
            print(run_planets)
        else:
            print("Run all planets")
            run_planets = [eachInd for eachInd in range(len(classroom_name))]

        for aNum in run_planets:
            # URL check
            if classroom_name[aNum][1] == "NA":
                continue

            # Assignment number
            assignmentNumber = classroom_name[aNum][0]

            # Assignment selection
            browser.get(classroom_name[aNum][1])
            time.sleep(20)
            html_source = browser.page_source
            soup = BeautifulSoup(html_source, "lxml")

            ##################################################################

            # Extraction of names and comments of all students both submitted & yet to submit
            names_comments_data = get_student_names(soup)
            ###################################################################

            # Extraction of links of all students both submitted & yet to submit
            links = get_student_classroom_links(soup)
            ###################################################################

            # Extracting informations of submitted assignments only

            submissions_count, submitted_index_start, submitted_index_end, submission_status = get_submissions_count(
                names_comments_data)

            if not submission_status:
                continue

            print("Number of submission in this classroom ", submissions_count)

            if submissions_count > 0:
                names_comments_submitted = names_comments_data[submitted_index_start:submitted_index_end+1]
                for i in range(len(names_comments_submitted)):
                    names_comments_submitted[i] = names_comments_submitted[i].split(
                        '"')

                submissions = []
                for i in range(submissions_count):
                    if len(names_comments_submitted[i]) > 1:
                        submissions.append(
                            [names_comments_submitted[i][0], names_comments_submitted[i][1], links[i]])
                    else:
                        submissions.append(
                            [names_comments_submitted[i][0], "", links[i]])
                ###################################################################

                # Sending email notifications of assignments

                submissions_notify = []
                print("\n\n")
                for i in range(len(submissions)):

                    resub_count, latestSubmissionTime, firstSubmissionTime, latestActiveTime = compare(
                        submissions[i][2])
                    submissions_notify.append({"assignment Name": ASSIGN[aNum],
                                               "student name": submissions[i][0],
                                               "link": submissions[i][2].split("/")[-1],
                                               "resub_count": resub_count,
                                               "Latest submission Time": latestSubmissionTime,
                                               "First submission Time": firstSubmissionTime,
                                               "Latest active Time": latestActiveTime,
                                               "Done status": 1 if "***done***" in submissions[i][1].lower() else 0
                                               })
                print(submissions_notify)
                df = get_dataframe(submissions_notify)
                if not df.empty:
                    sheets_created.append(
                        ASSIGN[aNum]+' : '+str(df.shape[0]) + " submissions ")
                    df.sort_values("Latest submission Time",
                                   inplace=True, ascending=False)
                    df.to_excel(writer, str(ASSIGN[aNum]))
                    print("sheet appended")

        try:
            # len_sheets = len(sheets_created)
            message_sheets_created = "\n".join(
                [str(ind+1)+"."+each_sheet for ind, each_sheet in enumerate(sheets_created)])
            print(message_sheets_created)
            send_email(subject=f"Classroom {classroom_type} : scan is complete",
                       body=f"Scan successful : {len(sheets_created)} sheets were were created \n\n{message_sheets_created}")
        except Exception as e:
            print(e, "Mail status : unsuccessful")

        writer.save()


if __name__ == '__main__':
    # #assignments

    argsParser = ArgumentParser()
    argsParser.add_argument(
        "--URL_FILE", help="path to the file containing classroom URLs")
    argsParser.add_argument("--PLANET", help="Classroom name")
    argsParser.add_argument("--ASSIGNMENTS", nargs='*', default=[], help="If only specific set of assignments are to be evaluated\
                           pass assignment code (read variable ASSIGN)")
    argsParser.add_argument(
        "--DELAY", default=0, help="Specify the delay(in seconds)between login and scan")

    args = argsParser.parse_args()
    # Read assignments from csv file
    print("Here", type(args.PLANET))
    print("Here", args.URL_FILE)
    print("Here", args.ASSIGNMENTS)

    PLANET_URL = []
    with open(args.URL_FILE, 'r') as f:
        reader = csv.reader(f)
        PLANET_URL = list(reader)
    PLANET_URL = PLANET_URL[1:]

    print(len(PLANET_URL), len(ASSIGN), args.PLANET)

    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument("--incognito")

    # Login to google classroom
    # Browser initialisation and classroom login
    browser = webdriver.Chrome(
        PATH_TO_DRIVER_EXE, chrome_options=chrome_options)
    browser.get(LOGIN_PATH)
    action = webdriver.ActionChains(browser)

    if not MANUAL_LOGIN:
        emailElem = browser.find_element_by_id('identifierId')
        emailElem.send_keys(USER_ID)
        nextButton = browser.find_element_by_id('identifierNext')
        nextButton.click()
        time.sleep(3)

        passwordElem = browser.find_element_by_name('password')
        passwordElem.send_keys(PASSWORD)
        signinButton = browser.find_element_by_id('passwordNext')
        signinButton.click()
    else:
        time.sleep(50)

    print(f"Sleeping for {int(args.DELAY)} seconds")
    time.sleep(int(args.DELAY))

    check_assignment(PLANET_URL, args.PLANET, assignment_code=args.ASSIGNMENTS)

    browser.stop_client()
    browser.close()
