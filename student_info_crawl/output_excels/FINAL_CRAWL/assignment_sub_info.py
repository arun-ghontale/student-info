import pandas as pd
df = pd.read_csv("2018-12-04.csv")

df_resubs = df.groupby(['assignment Name', 'resub_count']).count()[
    'student name']
resub_count_dict = {}
for every_tuple, every_value in zip(df_resubs.keys().values, df_resubs.values):
    resub_count_dict[every_tuple] = every_value

resub_count_total = dict()

for key, value in resub_count_dict.items():
    if key[0] in resub_count_total:
        resub_count_total[key[0]] += value*key[1]
    else:
        resub_count_total[key[0]] = value*key[1]

print(sum(resub_count_total.values()))

with open('all_resubmissions.txt', 'w') as f:
    f.write("assignment_name\tresubmission\n")
    for key, value in resub_count_total.items():
        f.write(str(key)+'\t'+str(value)+'\n')

with open('submissions_per_resubmission_count.txt', 'w') as f:
    f.write("assignment_name\tresubmission\tcount\n")
    for key, value in resub_count_dict.items():
        f.write(key[0]+'\t'+str(key[1])+'\t'+str(value)+'\n')
