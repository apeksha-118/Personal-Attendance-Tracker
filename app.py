from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

attendance = []

@app.route('/')
def home():
    return "Attendance Tracker API is running!"

@app.route('/add-attendance', methods=['POST'])
def add_attendance():
    data = request.json
    attendance.append(data)
    return jsonify({'message': 'Saved successfully!'})

@app.route('/get-attendance', methods=['GET'])
def get_attendance():
    return jsonify(attendance)

if __name__ == '__main__':
    app.run(debug=True)
