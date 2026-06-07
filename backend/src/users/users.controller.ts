import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Control } from 'src/common/meta/control.meta';
import { CreateUserDto } from './dto/createUser.dto';
import { Public } from 'src/common/meta/public.meta';
import { Description } from 'src/common/meta/description.meta';
import { Roles } from 'src/common/meta/role.meta';
import { UserRole } from './enum/role.enum';
import { UserStatus } from './enum/status.enum';
import { User } from 'src/common/meta/user.meta';
import { ApiConsumes } from '@nestjs/swagger';
import { ApiFile } from 'src/common/meta/upload-file.meta';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserDto } from './dto/updateUser.dto';
import { PaginationDto } from 'src/common/paging/paging.dto';
import { UpdateCustomerType } from './dto/updateCustomerType.dto';
import { ChangeStatus } from './dto/changeStatus.dto';
import { UpdateGuestsDto } from './dto/guest.dto';
import { UserCondition } from './dto/condition.dto';

@Control('users')
export class UsersController {
  private _userService: UsersService;
  constructor(userService: UsersService) {
    this._userService = userService;
  }

  @Public()
  @Post('createUser')
  @Description('Tạo một user mới', [
    { status: 200, description: 'create successfully' },
  ])
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this._userService.createUser(createUserDto);
  }

  @Roles(UserRole.ADMIN, UserRole.BOSS)
  @Post('createStaff')
  @Description('Tạo một user mới', [
    { status: 200, description: 'create successfully' },
  ])
  async createStaff(@Body() createUserDto: any) {
    return await this._userService.createStaff(createUserDto);
  }

  @Roles(UserRole.ADMIN, UserRole.BOSS)
  @Get('getUserByQuery')
  @Description('Lấy thông tin user', [
    { status: 200, description: 'create successfully' },
  ])
  async getUsers(@Query() condition: UserCondition) {
    return await this._userService.getUsersByCondition(condition);
  }

  @Roles(UserRole.ADMIN, UserRole.BOSS)
  @Get('getStaffByQuery')
  @Description('Lấy thông tin staff', [
    { status: 200, description: 'create successfully' },
  ])
  async getStaff(@Query() condition: PaginationDto) {
    return await this._userService.getStaffByCondition(condition);
  }

  @Roles(UserRole.ADMIN, UserRole.BOSS)
  @Put('updateStaffInfo')
  @Description('Cập nhật staff', [
    { status: 200, description: 'Update successfully' },
  ])
  async updateStaffInfo(@Query('id') id: string, @Body() data: any) {
    console.log('vooooo');
    return await this._userService.updateUserInfo(id, data);
  }

  @Roles(UserRole.ADMIN, UserRole.BOSS)
  @Delete('channgeStatusUser/:userId')
  @Description('Mở khóa, Khóa, Xóa người dùng [INACTIVE], [ACTIVE], [DELETE]', [
    { status: 200, description: 'lock successfully' },
  ])
  async channgeStatusUser(@Query() data: ChangeStatus) {
    return await this._userService.channgeStatusUser(data.userId, data.status);
  }

  @Public()
  @Put('updateUser')
  @ApiConsumes('multipart/form-data')
  @ApiFile()
  @UseInterceptors(FileInterceptor('file'))
  @Description('Update Info user', [
    { status: 200, description: 'update successfully' },
  ])
  async updateUser(
    @User() user,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file,
  ) {
    return await this._userService.updateUser(user, updateUserDto, file);
  }

  @Roles(UserRole.ADMIN, UserRole.BOSS)
  @Put('updateUserForAdmin')
  @ApiConsumes('multipart/form-data')
  @ApiFile()
  @UseInterceptors(FileInterceptor('file'))
  @Description('Update Info user', [
    { status: 200, description: 'update successfully' },
  ])
  async updateUserForAdmin(
    @Query('phone') phone: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file,
  ) {
    return await this._userService.updateUser(phone, updateUserDto, file);
  }

  @Roles(UserRole.USER)
  @Put('verify-account')
  @Description('Update Info user', [
    { status: 200, description: 'update successfully' },
  ])
  async verfifyAccount(@Req() req: any, @Body() body: UpdateUserDto) {
    return await this._userService.verifyAcccount(body, req.user.sub);
  }

  @Roles(UserRole.ADMIN, UserRole.BOSS)
  @Put('updateCustomerType')
  @Description('Update customer type', [
    { status: 200, description: 'update successfully' },
  ])
  async updateCustomerType(@Body() body: UpdateCustomerType) {
    return await this._userService.updateCustomerType(body);
  }

  @Roles(UserRole.USER)
  @Put('updateUserInfo')
  @Description('Update Info user', [
    { status: 200, description: 'update successfully' },
  ])
  async updateUserInfo(@Req() req: any, @Body() updateUserDto: UpdateUserDto) {
    console.log('vô');
    return await this._userService.updateUserInfo(req.user.sub, updateUserDto);
  }

  @Get('getMyInfo')
  @Description('Get My Info', [
    { status: 200, description: 'get successfully' },
  ])
  async getMyInfo(@User() username) {
    return await this._userService.findInfoByPhone(username);
  }

  @Roles(UserRole.ADMIN, UserRole.BOSS)
  @Put('updateGuestUser')
  @Description('Update customer type', [
    { status: 200, description: 'update successfully' },
  ])
  async updateGuestUser(@Body() updateGuesst: UpdateGuestsDto) {
    return await this._userService.updateGuestUser(updateGuesst);
  }

  @Get('test')
  @Description('test', [{ status: 200, description: 'update successfully' }])
  async test() {
    return await this._userService.coutPointForUserReferred('4ZPE32BGY5', 100000);
  }

}
