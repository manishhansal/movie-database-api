'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('movies', {
      fields: ['movieName'],
      type: 'unique',
      name: 'unique_movieName_movies',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('movies', 'unique_movieName_movies');
  },
};
