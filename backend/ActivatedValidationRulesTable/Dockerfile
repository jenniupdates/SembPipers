FROM python:3.9-slim

EXPOSE 5006

WORKDIR /usr/src/app

COPY ./backend/ActivatedValidationRulesTable/requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY ./backend/ActivatedValidationRulesTable/ActivatedValidationRulesTable.py ./

CMD [ "python", "./ActivatedValidationRulesTable.py"]