from App import app, db

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)


    # filtered_data = data[data['Code'].str.len() > 3]