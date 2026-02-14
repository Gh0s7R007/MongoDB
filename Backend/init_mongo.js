

print("Starting MongoDB Configuration for Student Tracking System...");


db = db.getSiblingDB('student_tracking_system');
print("Switched to database: " + db.getName());

try {

    const user = db.getUser("school_admin");
    if (user) {
        print("User 'school_admin' already exists.");
    } else {
        db.createUser({
            user: "school_admin",
            pwd: "password123",
            roles: [
                { role: "readWrite", db: "student_tracking_system" },
                { role: "dbAdmin", db: "student_tracking_system" }
            ]
        });
        print("User 'school_admin' created successfully.");
    }
} catch (error) {
    print("Error creating user: " + error);
}


const collections = ['students', 'teachers', 'courses', 'grades', 'admins'];
collections.forEach(collName => {
    try {
        db.createCollection(collName);
        print("Collection '" + collName + "' ensured.");
    } catch (e) {

        if (e.code !== 48) {
             print("Collection '" + collName + "' exists or error: " + e.message);
        }
    }
});


db.students.createIndex({ "email": 1 }, { unique: true });
db.students.createIndex({ "student_id": 1 }, { unique: true });


db.teachers.createIndex({ "email": 1 }, { unique: true });
db.teachers.createIndex({ "teacher_id": 1 }, { unique: true });


db.courses.createIndex({ "course_id": 1 }, { unique: true });

db.grades.createIndex({ "grade_id": 1 }, { unique: true });
db.grades.createIndex({ "student": 1 });
db.grades.createIndex({ "course": 1 });


print(db.getCollectionNames());

//const studentCount = db.students.countDocuments();
//print("Total Students: " + studentCount);
