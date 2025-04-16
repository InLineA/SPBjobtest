const { faker } = require('@faker-js/faker')
const fs = require('fs')

const generateUsers = (count) => {
    const users = []
    for (let i = 0; i < count; i++) {
        users.push({
            id: i,
            name: faker.person.fullName(),
            department: faker.commerce.department(),
            company: faker.company.name(),
            jobTitle: faker.person.jobTitle()
        })
    }
    return users
}

const users = generateUsers(1_000_000)

fs.writeFileSync('users.json', JSON.stringify(users, null, 2), 'utf-8')