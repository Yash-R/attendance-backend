import logger from '../logger/winston'
import { db } from '../database/mongo'
import { createObject, ControllerResponse, clientTokenData, deleteObject } from './interface'
import RESPONSES from '../responses/templates'

/**
 * Class to handle all operations related to Sessions
 */
class SessionOperations {
  static async createNewSession({ session }: createObject, client: clientTokenData): Promise<ControllerResponse> {
    try {
      if (!session) {
        return RESPONSES.INCOMPLETE_REQUEST()
      }

      session.admin = client.username
      session.participants = []
      session.createdAt = new Date().getTime()

      const sessionCreation = await db.collection('sessions').insertOne(session)
      const eventPush = await db.collection('events').updateOne(
        { slug: session.parent, admin: client.username },
        {
          $push: { sessions: session.slug },
        },
      )
      if (eventPush.result.nModified == 1) {
        logger.info('New Session Created Successfully')
        return RESPONSES.SUCCESS_OPERATION(null)
      } else {
        logger.error('Count not create Session due to event push error')
        return RESPONSES.NOT_FOUND()
      }

      //   catching errors
    } catch (err) {
      logger.error('Error Creating Session')
      return RESPONSES.ERROR(err)
    }
  }

  static async deleteSession({ session }: deleteObject, client: clientTokenData): Promise<ControllerResponse> {
    try {
      if (!session) {
        return RESPONSES.INCOMPLETE_REQUEST()
      }

      const sessionDeletion = await db.collection('sessions').deleteOne({ slug: session.slug, admin: client.username })

      if (sessionDeletion.result.n == 1) {
        const eventPullOperation = await db.collection('events').updateOne(
          { slug: session.parent, admin: client.username },
          {
            $pull: { sessions: session.slug },
          },
        )
        console.log(eventPullOperation)

        return RESPONSES.SUCCESS_OPERATION()
      } else {
        return RESPONSES.NOT_FOUND()
      }
    } catch (err) {
      logger.error('Error Deleting Session')
      return RESPONSES.ERROR(err)
    }
  }
}

export default SessionOperations
