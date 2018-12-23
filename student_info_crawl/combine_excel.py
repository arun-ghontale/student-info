import pandas as pd
from argparse import ArgumentParser
from functools import reduce
import os


def combine_sheets(path_to_excel):
    df = pd.read_excel(path_to_excel, sheet_name=None, ignore_index=True)
    cdf = pd.concat(df.values())
    return cdf


if __name__ == '__main__':
    argsParser = ArgumentParser()
    argsParser.add_argument(
        "--FOLDER", help="path to the folder containing crawled info")

    args = argsParser.parse_args()
    # Read assignments from csv file
    list_of_files = [os.path.join(args.FOLDER, each) for each in os.listdir(
        args.FOLDER) if each.endswith('.xlsx') or each.endswith('.xls')]

    list_of_df = []
    for each_excel in list_of_files:
        list_of_df.append(combine_sheets(each_excel))

    df_all = pd.concat(list_of_df, ignore_index=True)
    df_all["Done status"] = df_all["Done status"].apply(
        lambda x: 1 if x == "Not Done" else 0)
    print(df_all.shape, df_all.head())

    FILE_SAVE = os.path.join(os.sep.join(args.FOLDER.split(
        os.sep)[:-1]), "FINAL_CRAWL", args.FOLDER.split(os.sep)[-1]+".csv")
    print(FILE_SAVE)
    df_all.to_csv(FILE_SAVE)
