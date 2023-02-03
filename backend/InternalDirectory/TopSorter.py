import pandas as pd
import re
from collections import defaultdict

# assume that the graph is not cyclic
class Graph:
    def __init__(self, numberofVertices):
        self.graph = defaultdict(list)
        self.numberofVertices = numberofVertices
    
    def addEdge(self, vertex, edge):
        self.graph[vertex].append(edge)

    def topogologicalSortUtil(self, v, visited, stack):
        visited.append(v)

        for i in self.graph[v]:
            if i not in visited:
                self.topogologicalSortUtil(i, visited, stack)
            
        stack.insert(0, v)
        
    def topologicalSort(self):
        visited = []
        stack = []

        for k in list(self.graph):
            if k not in visited:
                self.topogologicalSortUtil(k, visited, stack)
            
        return stack 



def relatedcol(names):
    # only accomodate for variable formulas, but not the core.func_call() all those yet
    # P1U1SN1103 got "PH"
    y = re.findall(r"[P]\w+", names)
    return list(dict.fromkeys([z for z in y if len(z) >= 6]))

def topo_sort(df):
    names = df['Internal_Name'].tolist()
    df['related'] = df.apply(lambda x: relatedcol(x['Formula_Python']), axis=1)
    related_dic = {}
    for index, row in df.iterrows():
        related_dic[row['Internal_Name']] = row['related']

    g = Graph(len(related_dic))
    for k, v in related_dic.items():
        for x in v:
            g.addEdge(k, x)
    
    topsorted = g.topologicalSort()
    return (topsorted[::-1], True)

