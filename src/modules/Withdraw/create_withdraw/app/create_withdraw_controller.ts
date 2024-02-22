/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  MissingParameters,
  WrongTypeParameters,
} from '../../../../shared/helpers/errors/controller_errors'
import { EntityError } from '../../../../shared/helpers/errors/domain_errors'
import { IRequest } from '../../../../shared/helpers/external_interfaces/external_interface'
import {
  BadRequest,
  Created,
  InternalServerError,
  NotFound,
} from '../../../../shared/helpers/external_interfaces/http_codes'
import { CreateWithdrawUsecase } from '../../../../../src/modules/Withdraw/create_withdraw/app/create_withdraw_usecase'
import { CreateViewmodel } from './create_withdraw_viewmodel'
import { Withdraw } from '../../../../../src/shared/domain/entities/withdraw'
import { NoItemsFound } from '../../../../shared/helpers/errors/usecase_errors'

export class CreateWithdrawController {
  constructor(private usecase: CreateWithdrawUsecase) {}

  async handle(request: IRequest) {
    try {
      const { notebookSerialNumber } = request.data as {
        notebookSerialNumber: string
      }

      const name = 'Jose Aldo'
      const studentRA = '22.12345-2'

      if (!notebookSerialNumber) {
        throw new MissingParameters('notebookSerialNumber')
      }
      if (!name) {
        throw new MissingParameters('name')
      }
      if (!studentRA) {
        throw new MissingParameters('studentRA')
      }

      if (!Withdraw.validateStudentRA(studentRA)) {
        throw new EntityError('studentRA')
      }

      const initTime = new Date().getTime()

      const withdraw = await this.usecase.execute(
        notebookSerialNumber,
        studentRA,
        name,
        initTime,
      )

      const viewmodel = new CreateViewmodel(withdraw)

      const response = new Created(viewmodel.toJSON())

      return response
    } catch (error: any) {
      if (error instanceof NoItemsFound) {
        return new NotFound(error.message)
      }
      if (
        error instanceof MissingParameters ||
        error instanceof WrongTypeParameters ||
        error instanceof EntityError
      ) {
        return new BadRequest(error.message)
      }
      return new InternalServerError(error.message)
    }
  }
}
