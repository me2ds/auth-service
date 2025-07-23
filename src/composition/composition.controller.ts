import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CompositionService } from './composition.service';
import { CreateCompositionDto } from './dto/create-composition.dto';
import { UpdateCompositionDto } from './dto/update-composition.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('composition')
@UseGuards(JwtAuthGuard)
export class CompositionController {
  constructor(private readonly compositionService: CompositionService) {}

  @Post()
  create(
    @Body() createCompositionDto: CreateCompositionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.compositionService.create({
      ...createCompositionDto,
      ownerId: user.id,
    } as any);
  }

  @Get()
  findAll() {
    return this.compositionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.compositionService.findOne(id);
  }

  @Get('my')
  findMyCompositions(@CurrentUser() user: JwtPayload) {
    return this.compositionService.findByOwnerId(user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCompositionDto: UpdateCompositionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.compositionService.update(id, updateCompositionDto, user.id);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.compositionService.remove(id, user.id);
  }
}
