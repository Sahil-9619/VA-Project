// Insert a normal user
db.users.insertOne({
email: "user1@lms.com",
password: "$$2b$10$zA4YPQj5xJqKjuoUvB06c.NAtSce7iJqbx7.g0tGttGiHQXI2qaVG", // always store bcrypt hash
name: "User One",
role: ObjectId("68d2438dc08916de2fa335d3"), // role: user
maxDevices: 1,
isVerified: true,
sessions: []
});

// Insert an instructor
db.users.insertOne({
email: "instructor1@lms.com",
password: "$$2b$10$zA4YPQj5xJqKjuoUvB06c.NAtSce7iJqbx7.g0tGttGiHQXI2qaVG",
name: "Instructor One",
role: ObjectId("68d2438dc08916de2fa335d2"), // role: instructor
maxDevices: 3,
isVerified: true,
sessions: []
});

// Insert another admin
db.users.insertOne({
email: "admin2@lms.com",
password: "$$2b$10$zA4YPQj5xJqKjuoUvB06c.NAtSce7iJqbx7.g0tGttGiHQXI2qaVG",
name: "Admin Two",
role: ObjectId("68d2438dc08916de2fa335d1"), // role: admin
maxDevices: 5,
isVerified: true,
sessions: []
});
