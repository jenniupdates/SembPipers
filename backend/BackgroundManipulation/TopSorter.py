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
    y = re.findall(r"[P]\w+", names)
    return list(dict.fromkeys([z for z in y if len(z) >= 2]))

def topo_sort(df):
    df['related'] = df.apply(lambda x: relatedcol(x['formula_python']), axis=1)
    related_dic = {}
    for i in df.index:
        key = df.iloc[i]["internal_name"]
        related_dic[key] = df.iloc[i]["related"]

    g = Graph(len(related_dic))
    for k, v in related_dic.items():
        for x in v:
            g.addEdge(k, x)
    
    topsorted = g.topologicalSort()
    return topsorted[::-1]

