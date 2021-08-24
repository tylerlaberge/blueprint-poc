import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EditorComponent } from './editor/editor.component';
import { PortDatatypeComponent } from './blueprint/port/port-datatype/port-datatype.component';
import { PortDeleteButtonComponent } from './blueprint/port/port-delete-button/port-delete-button.component';
import { PortCircleComponent } from './blueprint/port/port-circle/port-circle.component';
import { PortControlComponent } from './blueprint/port/port-control.component';
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
    PortCircleComponent,
    PortControlComponent,
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
