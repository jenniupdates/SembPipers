FROM python:3.9-slim

EXPOSE 5021

WORKDIR /usr/src/app

COPY ./backend/ActivatedValidationFormulaTable/requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY ./backend/ActivatedValidationFormulaTable/ActivatedValidationFormulaTable.py ./backend/ActivatedValidationFormulaTable/ValidationFormulaTable.py ./backend/ActivatedValidationFormulaTable/TopSorter.py ./backend/ActivatedValidationFormulaTable/InternalDirectory.py ./

CMD [ "python", "./ActivatedValidationFormulaTable.py"]