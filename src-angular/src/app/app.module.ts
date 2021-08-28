import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EditorComponent } from './editor/editor.component';
import { PortDatatypeComponent } from './blueprint/port/port-datatype/port-datatype.component';
import { PortDeleteButtonComponent } from './blueprint/port/port-delete-button/port-delete-button.component';
import { PortAddButtonComponent } from './blueprint/port/port-add-button/port-add-button.component';
import { PortCircleComponent } from './blueprint/port/port-circle/port-circle.component';
import { PortControlComponent } from './blueprint/port/port-control/port-control.component';
import { PortListControlComponent } from './blueprint/port/port-list-control/port-list-control.component';
import { BlueprintInputsComponent } from './blueprint/blueprint-inputs/blueprint-inputs.component';
import { BlueprintOutputsComponent } from './blueprint/blueprint-outputs/blueprint-outputs.component';
import { BlueprintComponent } from './blueprint/blueprint.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MatInputModule } from '@angular/material/input';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    EditorComponent,
    PortDatatypeComponent,
    PortDeleteButtonComponent,
    PortAddButtonComponent,
    PortCircleComponent,
    PortControlComponent,
    PortListControlComponent,
    BlueprintInputsComponent,
    BlueprintOutputsComponent,
    BlueprintComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    DragDropModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
