'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("movies", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
        unique: true,
      },
      movieName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      movieDes: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      yearOfPublished: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      moviePoster: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("movies");
  },
};
