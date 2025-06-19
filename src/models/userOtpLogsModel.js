import { DataTypes, Model } from 'sequelize';
import sequelize from '../models/dbConfig.js';

class UserOtpLogs extends Model {
    static associate(models) {
        UserOtpLogs.belongsTo(models.User, {
            foreignKey: 'user_id',
            targetKey: 'user_id',
        });
    }
}

UserOtpLogs.init(
    {
        otp_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        otp: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'Encrypted OTP',
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        expired_at: {
            type: DataTypes.DATE,
            allowNull: true,
        }
    },
    {
        sequelize,
        tableName: 'user_otp_logs',
        timestamps: false,
    }
);

export { UserOtpLogs };
