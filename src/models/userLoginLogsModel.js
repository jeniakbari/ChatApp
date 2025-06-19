import { DataTypes, Model } from 'sequelize';
import sequelize from '../models/dbConfig.js';

class UserLoginLogs extends Model {
    static associate(models) {
        UserLoginLogs.belongsTo(models.User, {
            foreignKey: 'user_id',
            targetKey: 'user_id'
        });
    }
}

UserLoginLogs.init(
    {
        user_login_log_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        access_token: {
            type: DataTypes.STRING(255),
            unique: {
                name: 'unique_access_token',
                msg: 'Access token must be unique',
              },
            allowNull: false,
        },
        is_logout: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        access_token_expiration_datetime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        logout_datetime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        refresh_token: {
            type: DataTypes.STRING(256),
            unique: {
                name: 'unique_refresh_token',
                msg: 'Refresh token must be unique',
              },
            allowNull: true,
        },
        refresh_token_expire_datetime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        }
    },
    {
        sequelize,
        tableName: 'user_login_logs',
        timestamps: false
    }
);

export { UserLoginLogs };
