FROM python:3.9-slim

EXPOSE 5030

WORKDIR /usr/src/app

COPY ./backend/ScriptJobs/requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY ./backend/ScriptJobs/BackgroundManipulation.py ./backend/ScriptJobs/DemoSensorInput.py ./backend/ScriptJobs/ActivatedValidationFormulaTable.py ./backend/ScriptJobs/ValidationFormulaTable.py ./backend/ScriptJobs/TopSorter.py ./backend/ScriptJobs/InternalDirectory.py ./

CMD [ "python", "./BackgroundManipulation.py"]